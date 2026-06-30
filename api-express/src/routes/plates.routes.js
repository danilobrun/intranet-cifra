const { checkToken, ensureRoleCodes } = require("../middleware/checktoken");
const {
  listPlates,
  listInactivePlatesController,
  listPlateMovementsController,
  createPlateController,
  desactivatePlateController,
  restorePlateController,
  updatePlateController,
} = require("../presentation/controllers/plates.controller");

const PLATE_ACCESS_ROLES = [
  "1",
  "admin",
  "gerente_frota",
  "auxiliar_frota",
  "coordenador",
  "frota",
];

const PLATE_INACTIVE_ACCESS_ROLES = [
  "1",
  "admin",
  "gerente_frota",
  "auxiliar_frota",
  "frota",
];

const PLATE_EDIT_ROLES = [
  "1",
  "admin",
  "gerente_frota",
  "frota",
  "auxiliar_frota",
  "coordenador",
];

const PLATE_MANAGE_INACTIVE_ROLES = [
  "1",
  "admin",
  "gerente_frota",
  "auxiliar_frota",
  "frota",
];

const platesRoutes = (app) => {
  app.get(
    "/plates",
    checkToken,
    ensureRoleCodes(PLATE_ACCESS_ROLES),
    listPlates,
  );
  app.get(
    "/plates/inactive",
    checkToken,
    ensureRoleCodes(PLATE_INACTIVE_ACCESS_ROLES),
    listInactivePlatesController,
  );
  app.post(
    "/plates",
    checkToken,
    ensureRoleCodes(PLATE_ACCESS_ROLES),
    createPlateController,
  );
  app.get(
    "/plates/:id/movements",
    checkToken,
    ensureRoleCodes(PLATE_INACTIVE_ACCESS_ROLES),
    listPlateMovementsController,
  );
  app.patch(
    "/plates/:id",
    checkToken,
    ensureRoleCodes(PLATE_EDIT_ROLES),
    updatePlateController,
  );
  app.delete(
    "/plates/:id",
    checkToken,
    ensureRoleCodes(PLATE_MANAGE_INACTIVE_ROLES),
    desactivatePlateController,
  );
  app.patch(
    "/plates/:id/restore",
    checkToken,
    ensureRoleCodes(PLATE_MANAGE_INACTIVE_ROLES),
    restorePlateController,
  );
};

module.exports = platesRoutes;
