const mongoose = require("mongoose");
const Tutorial = require("../../../models/Tutorial");

const TUTORIAL_STATUSES = ["rascunho", "publicado", "arquivado"];
const STATUS_DRAFT = "rascunho";
const STATUS_PUBLISHED = "publicado";
const STATUS_ARCHIVED = "arquivado";

const userPopulateConfig = [
  { path: "createdBy", select: "_id name email" },
  { path: "updatedBy", select: "_id name email" },
];

const getText = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const normalizeStatus = (value) => getText(value).toLowerCase();

const isAdmin = (req) => {
  const roles = Array.isArray(req.user?.roles) ? req.user.roles : [];
  return roles.includes("1");
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getSearchFilter = (query = {}) => {
  const search = getText(query.q || query.search);

  if (!search) {
    return {};
  }

  const regex = new RegExp(escapeRegex(search), "i");

  return {
    $or: [
      { title: regex },
      { summary: regex },
      { "steps.title": regex },
      { "steps.description": regex },
    ],
  };
};

const getStatusFilter = (status) => {
  const normalizedStatus = normalizeStatus(status);

  if (
    !normalizedStatus ||
    normalizedStatus === "todos" ||
    normalizedStatus === "all"
  ) {
    return {
      ok: true,
      filter: {},
    };
  }

  if (!TUTORIAL_STATUSES.includes(normalizedStatus)) {
    return {
      ok: false,
      msg: "Status de tutorial inválido.",
    };
  }

  return {
    ok: true,
    filter: { status: normalizedStatus },
  };
};

const mapUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
  };
};

const mapStep = (step) => ({
  order: step.order,
  title: step.title,
  description: step.description,
  youtubeUrl: step.youtubeUrl || "",
  youtubeVideoId: step.youtubeVideoId || "",
  note: step.note || "",
  warning: step.warning || "",
  expectedResult: step.expectedResult || "",
});

const getTutorialBaseResponse = (tutorial) => {
  const steps = Array.isArray(tutorial.steps) ? tutorial.steps : [];

  return {
    _id: tutorial._id,
    title: tutorial.title,
    summary: tutorial.summary || "",
    status: tutorial.status,
    stepsCount: steps.length,
    hasVideo: steps.some((step) => step.youtubeVideoId || step.youtubeUrl),
    createdBy: mapUser(tutorial.createdBy),
    updatedBy: mapUser(tutorial.updatedBy),
    createdAt: tutorial.createdAt,
    updatedAt: tutorial.updatedAt,
    publishedAt: tutorial.publishedAt,
    archivedAt: tutorial.archivedAt,
  };
};

const mapTutorialListResponse = (tutorial) => getTutorialBaseResponse(tutorial);

const mapTutorialDetailResponse = (tutorial) => ({
  ...getTutorialBaseResponse(tutorial),
  steps: Array.isArray(tutorial.steps) ? tutorial.steps.map(mapStep) : [],
});

const getYouTubeVideoId = (rawUrl) => {
  const youtubeUrl = getText(rawUrl);

  if (!youtubeUrl) {
    return "";
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(youtubeUrl);
  } catch {
    return null;
  }

  const host = parsedUrl.hostname.replace(/^www\./, "").replace(/^m\./, "");
  const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
  let videoId = "";

  if (host === "youtu.be") {
    videoId = pathParts[0] || "";
  }

  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (parsedUrl.pathname === "/watch") {
      videoId = parsedUrl.searchParams.get("v") || "";
    } else if (pathParts[0] === "embed" || pathParts[0] === "shorts") {
      videoId = pathParts[1] || "";
    }
  }

  if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
    return null;
  }

  return videoId;
};

const normalizeSteps = (steps) => {
  if (!steps) {
    return {
      ok: true,
      steps: [],
    };
  }

  if (!Array.isArray(steps)) {
    return {
      ok: false,
      msg: "Os passos do tutorial precisam ser uma lista.",
    };
  }

  const normalizedSteps = [];

  for (let index = 0; index < steps.length; index += 1) {
    const step = steps[index];

    if (!step || typeof step !== "object") {
      return {
        ok: false,
        msg: `Passo ${index + 1} invalido.`,
      };
    }

    const title = getText(step.title);
    const description = getText(step.description);
    const youtubeUrl = getText(step.youtubeUrl);
    const note = getText(step.note);
    const warning = getText(step.warning);
    const expectedResult = getText(step.expectedResult);
    const hasAnyContent = [
      title,
      description,
      youtubeUrl,
      note,
      warning,
      expectedResult,
    ].some(Boolean);

    if (!hasAnyContent) {
      continue;
    }

    if (!title) {
      return {
        ok: false,
        msg: `O título do passo ${index + 1} é obrigatório.`,
      };
    }

    if (!description) {
      return {
        ok: false,
        msg: `A descrição do passo ${index + 1} é obrigatória.`,
      };
    }

    const youtubeVideoId = getYouTubeVideoId(youtubeUrl);

    if (youtubeUrl && !youtubeVideoId) {
      return {
        ok: false,
        msg: `A URL do YouTube no passo ${index + 1} é inválida.`,
      };
    }

    normalizedSteps.push({
      order: normalizedSteps.length + 1,
      title,
      description,
      youtubeUrl,
      youtubeVideoId,
      note,
      warning,
      expectedResult,
    });
  }

  return {
    ok: true,
    steps: normalizedSteps,
  };
};

const validatePublishRules = ({ status, summary, steps }) => {
  if (status !== STATUS_PUBLISHED) {
    return {
      ok: true,
    };
  }

  if (!summary) {
    return {
      ok: false,
      msg: "O resumo é obrigatório para publicar o tutorial.",
    };
  }

  if (!Array.isArray(steps) || !steps.length) {
    return {
      ok: false,
      msg: "O tutorial precisa ter pelo menos um passo para ser publicado.",
    };
  }

  return {
    ok: true,
  };
};

const getTutorialPayload = (body = {}, options = {}) => {
  const title = getText(body.title);
  const summary = getText(body.summary);
  const status =
    normalizeStatus(body.status) || options.defaultStatus || STATUS_DRAFT;
  const stepsResult = normalizeSteps(body.steps);

  if (!title) {
    return {
      ok: false,
      msg: "O título é obrigatório.",
    };
  }

  if (!TUTORIAL_STATUSES.includes(status)) {
    return {
      ok: false,
      msg: "Status de tutorial inválido.",
    };
  }

  if (!options.allowArchivedStatus && status === STATUS_ARCHIVED) {
    return {
      ok: false,
      msg: "Não é possível criar um tutorial já arquivado.",
    };
  }

  if (!stepsResult.ok) {
    return stepsResult;
  }

  const publishValidation = validatePublishRules({
    status,
    summary,
    steps: stepsResult.steps,
  });

  if (!publishValidation.ok) {
    return publishValidation;
  }

  return {
    ok: true,
    payload: {
      title,
      summary,
      status,
      steps: stepsResult.steps,
    },
  };
};

const applyStatusDates = (tutorial, nextStatus) => {
  const previousStatus = tutorial.status;

  if (previousStatus === nextStatus) {
    return;
  }

  if (nextStatus === STATUS_PUBLISHED) {
    tutorial.publishedAt = new Date();
    tutorial.archivedAt = null;
  }

  if (nextStatus === STATUS_ARCHIVED) {
    tutorial.archivedAt = new Date();
  }

  if (nextStatus === STATUS_DRAFT) {
    tutorial.publishedAt = null;
    tutorial.archivedAt = null;
  }
};

const findTutorialById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return {
      ok: false,
      status: 422,
      msg: "Tutorial inválido.",
    };
  }

  const tutorial = await Tutorial.findById(id).populate(userPopulateConfig);

  if (!tutorial) {
    return {
      ok: false,
      status: 404,
      msg: "Tutorial não encontrado.",
    };
  }

  return {
    ok: true,
    tutorial,
  };
};

const listTutorials = async (req, res) => {
  try {
    const filter = {
      status: STATUS_PUBLISHED,
      ...getSearchFilter(req.query),
    };

    const tutorials = await Tutorial.find(filter)
      .populate(userPopulateConfig)
      .sort({ updatedAt: -1 });

    return res.status(200).json(tutorials.map(mapTutorialListResponse));
  } catch (error) {
    console.log("listTutorials error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

const listAdminTutorials = async (req, res) => {
  const statusFilter = getStatusFilter(req.query?.status);

  if (!statusFilter.ok) {
    return res.status(422).json({ msg: statusFilter.msg });
  }

  try {
    const filter = {
      ...statusFilter.filter,
      ...getSearchFilter(req.query),
    };

    const tutorials = await Tutorial.find(filter)
      .populate(userPopulateConfig)
      .sort({ updatedAt: -1 });

    return res.status(200).json(tutorials.map(mapTutorialListResponse));
  } catch (error) {
    console.log("listAdminTutorials error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

const listTutorialById = async (req, res) => {
  try {
    const result = await findTutorialById(req.params.id);

    if (!result.ok) {
      return res.status(result.status).json({ msg: result.msg });
    }

    if (!isAdmin(req) && result.tutorial.status !== STATUS_PUBLISHED) {
      return res.status(404).json({ msg: "Tutorial não encontrado." });
    }

    return res.status(200).json(mapTutorialDetailResponse(result.tutorial));
  } catch (error) {
    console.log("listTutorialById error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

const createTutorial = async (req, res) => {
  const result = getTutorialPayload(req.body, {
    defaultStatus: STATUS_DRAFT,
    allowArchivedStatus: false,
  });

  if (!result.ok) {
    return res.status(422).json({ msg: result.msg });
  }

  try {
    const tutorial = new Tutorial({
      ...result.payload,
      createdBy: req.user.id,
      updatedBy: req.user.id,
    });

    if (tutorial.status === STATUS_PUBLISHED) {
      tutorial.publishedAt = new Date();
      tutorial.archivedAt = null;
    }

    await tutorial.save();
    await tutorial.populate(userPopulateConfig);

    return res.status(201).json({
      msg: "Tutorial criado com sucesso.",
      tutorial: mapTutorialDetailResponse(tutorial),
    });
  } catch (error) {
    console.log("createTutorial error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

const editTutorial = async (req, res) => {
  try {
    const findResult = await findTutorialById(req.params.id);

    if (!findResult.ok) {
      return res.status(findResult.status).json({ msg: findResult.msg });
    }

    const tutorial = findResult.tutorial;
    const payloadResult = getTutorialPayload(req.body, {
      defaultStatus: tutorial.status,
      allowArchivedStatus: true,
    });

    if (!payloadResult.ok) {
      return res.status(422).json({ msg: payloadResult.msg });
    }

    applyStatusDates(tutorial, payloadResult.payload.status);

    tutorial.title = payloadResult.payload.title;
    tutorial.summary = payloadResult.payload.summary;
    tutorial.status = payloadResult.payload.status;
    tutorial.steps = payloadResult.payload.steps;
    tutorial.updatedBy = req.user.id;

    await tutorial.save();
    await tutorial.populate(userPopulateConfig);

    return res.status(200).json({
      msg: "Tutorial atualizado com sucesso.",
      tutorial: mapTutorialDetailResponse(tutorial),
    });
  } catch (error) {
    console.log("editTutorial error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

const updateTutorialStatus = async (req, res) => {
  const nextStatus = normalizeStatus(req.body?.status);

  if (!TUTORIAL_STATUSES.includes(nextStatus)) {
    return res.status(422).json({ msg: "Status de tutorial invalido." });
  }

  try {
    const findResult = await findTutorialById(req.params.id);

    if (!findResult.ok) {
      return res.status(findResult.status).json({ msg: findResult.msg });
    }

    const tutorial = findResult.tutorial;
    const publishValidation = validatePublishRules({
      status: nextStatus,
      summary: tutorial.summary,
      steps: tutorial.steps,
    });

    if (!publishValidation.ok) {
      return res.status(422).json({ msg: publishValidation.msg });
    }

    applyStatusDates(tutorial, nextStatus);
    tutorial.status = nextStatus;
    tutorial.updatedBy = req.user.id;

    await tutorial.save();
    await tutorial.populate(userPopulateConfig);

    return res.status(200).json({
      msg: "Status do tutorial atualizado com sucesso.",
      tutorial: mapTutorialDetailResponse(tutorial),
    });
  } catch (error) {
    console.log("updateTutorialStatus error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

const archiveTutorial = async (req, res) => {
  try {
    const findResult = await findTutorialById(req.params.id);

    if (!findResult.ok) {
      return res.status(findResult.status).json({ msg: findResult.msg });
    }

    const tutorial = findResult.tutorial;

    applyStatusDates(tutorial, STATUS_ARCHIVED);
    tutorial.status = STATUS_ARCHIVED;
    tutorial.updatedBy = req.user.id;

    if (!tutorial.archivedAt) {
      tutorial.archivedAt = new Date();
    }

    await tutorial.save();
    await tutorial.populate(userPopulateConfig);

    return res.status(200).json({
      msg: "Tutorial arquivado com sucesso.",
      tutorial: mapTutorialDetailResponse(tutorial),
    });
  } catch (error) {
    console.log("archiveTutorial error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

const deleteArchivedTutorial = async (req, res) => {
  try {
    const findResult = await findTutorialById(req.params.id);

    if (!findResult.ok) {
      return res.status(findResult.status).json({ msg: findResult.msg });
    }

    const tutorial = findResult.tutorial;

    if (tutorial.status !== STATUS_ARCHIVED) {
      return res.status(409).json({
        msg: "A exclusão definitiva só é permitida para tutoriais arquivados.",
      });
    }

    await Tutorial.findByIdAndDelete(tutorial._id);

    return res.status(200).json({
      msg: "Tutorial excluído definitivamente com sucesso.",
    });
  } catch (error) {
    console.log("deleteArchivedTutorial error", error);
    return res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
};

module.exports = {
  listTutorials,
  listAdminTutorials,
  listTutorialById,
  createTutorial,
  editTutorial,
  updateTutorialStatus,
  archiveTutorial,
  deleteArchivedTutorial,
};
