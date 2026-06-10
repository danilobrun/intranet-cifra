const mapFaturamentoResponse = (faturamento) => ({
  _id: faturamento._id,
  boletimId: faturamento.boletimId,
  valorFaturado: faturamento.valorFaturado,
  dataFaturamento: faturamento.dataFaturamento,
});

const mapPagamentoResponse = (pagamento) => ({
  _id: pagamento._id,
  boletimId: pagamento.boletimId,
  valorPago: pagamento.valorPago,
  dataPagamento: pagamento.dataPagamento,
});

const createBoletinsLancamentosController = ({
  mongoose,
  Faturamento,
  Pagamento,
  getCurrentUserProfile,
  getBoletimForLancamento,
  parsePositiveNumber,
  parseRequiredDate,
  getTotalsForBoletim,
  getFinancialSummary,
  toCents,
  mapBoletimResponse,
}) => {
  const createFaturamento = async (req, res) => {
    try {
      const profile = await getCurrentUserProfile(req);
      if (!profile.ok) {
        return res.status(profile.status).json({ msg: profile.msg });
      }

      const boletimResult = await getBoletimForLancamento(
        req.params.boletimId || req.body?.boletimId,
        profile,
        { requireNotDeleted: true },
      );

      if (!boletimResult.ok) {
        return res.status(boletimResult.status).json({ msg: boletimResult.msg });
      }

      const valorResult = parsePositiveNumber(
        req.body?.valorFaturado,
        "O valor faturado",
      );
      if (!valorResult.ok) {
        return res.status(422).json({ msg: valorResult.msg });
      }

      const dataResult = parseRequiredDate(
        req.body?.dataFaturamento,
        "Data de faturamento",
      );
      if (!dataResult.ok) {
        return res.status(422).json({ msg: dataResult.msg });
      }

      const boletim = boletimResult.boletim;
      const totals = await getTotalsForBoletim(boletim._id);
      const financial = getFinancialSummary(boletim, totals);
      const valorTotalBmCents = toCents(financial.valorTotalBm);
      const totalFaturadoCents = toCents(totals.totalFaturado);
      const nextTotalFaturadoCents =
        totalFaturadoCents + toCents(valorResult.value);

      if (totalFaturadoCents >= valorTotalBmCents) {
        return res.status(409).json({
          msg: "Boletim ja esta totalmente faturado.",
        });
      }

      if (nextTotalFaturadoCents > valorTotalBmCents) {
        return res.status(409).json({
          msg: "Total faturado nao pode ultrapassar o valor total do BM.",
        });
      }

      const faturamento = new Faturamento({
        boletimId: boletim._id,
        valorFaturado: valorResult.value,
        dataFaturamento: dataResult.value,
      });

      await faturamento.save();

      const updatedTotals = await getTotalsForBoletim(boletim._id);

      return res.status(201).json({
        msg: "Faturamento lancado com sucesso.",
        faturamento: mapFaturamentoResponse(faturamento),
        boletim: mapBoletimResponse(boletim, updatedTotals),
      });
    } catch (error) {
      console.log("createFaturamento error", error);
      return res.status(500).json({
        msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
      });
    }
  };

  const listFaturamentosByBoletim = async (req, res) => {
    try {
      const profile = await getCurrentUserProfile(req);
      if (!profile.ok) {
        return res.status(profile.status).json({ msg: profile.msg });
      }

      const boletimResult = await getBoletimForLancamento(
        req.params.boletimId,
        profile,
      );

      if (!boletimResult.ok) {
        return res.status(boletimResult.status).json({ msg: boletimResult.msg });
      }

      const faturamentos = await Faturamento.find({
        boletimId: boletimResult.boletim._id,
      }).sort({ dataFaturamento: -1, _id: -1 });

      return res.status(200).json(faturamentos.map(mapFaturamentoResponse));
    } catch (error) {
      console.log("listFaturamentosByBoletim error", error);
      return res.status(500).json({
        msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
      });
    }
  };

  const deleteFaturamento = async (req, res) => {
    try {
      const profile = await getCurrentUserProfile(req);
      if (!profile.ok) {
        return res.status(profile.status).json({ msg: profile.msg });
      }

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(422).json({ msg: "Faturamento invalido." });
      }

      const faturamento = await Faturamento.findById(req.params.id);

      if (!faturamento) {
        return res.status(404).json({ msg: "Faturamento nao encontrado." });
      }

      const boletimResult = await getBoletimForLancamento(
        faturamento.boletimId,
        profile,
      );

      if (!boletimResult.ok) {
        return res.status(boletimResult.status).json({ msg: boletimResult.msg });
      }

      const totals = await getTotalsForBoletim(faturamento.boletimId);
      const totalFaturadoRestanteCents =
        toCents(totals.totalFaturado) - toCents(faturamento.valorFaturado);
      const totalPagoCents = toCents(totals.totalPago);

      if (totalFaturadoRestanteCents < totalPagoCents) {
        return res.status(409).json({
          msg: "Nao e possivel excluir faturamento porque o total faturado restante ficaria menor que o total pago.",
        });
      }

      await Faturamento.findByIdAndDelete(faturamento._id);

      const updatedTotals = await getTotalsForBoletim(boletimResult.boletim._id);

      return res.status(200).json({
        msg: "Faturamento excluido com sucesso.",
        boletim: mapBoletimResponse(boletimResult.boletim, updatedTotals),
      });
    } catch (error) {
      console.log("deleteFaturamento error", error);
      return res.status(500).json({
        msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
      });
    }
  };

  const createPagamento = async (req, res) => {
    try {
      const profile = await getCurrentUserProfile(req);
      if (!profile.ok) {
        return res.status(profile.status).json({ msg: profile.msg });
      }

      const boletimResult = await getBoletimForLancamento(
        req.params.boletimId || req.body?.boletimId,
        profile,
        { requireNotDeleted: true },
      );

      if (!boletimResult.ok) {
        return res.status(boletimResult.status).json({ msg: boletimResult.msg });
      }

      const valorResult = parsePositiveNumber(
        req.body?.valorPago,
        "O valor pago",
      );
      if (!valorResult.ok) {
        return res.status(422).json({ msg: valorResult.msg });
      }

      const dataResult = parseRequiredDate(
        req.body?.dataPagamento,
        "Data de pagamento",
      );
      if (!dataResult.ok) {
        return res.status(422).json({ msg: dataResult.msg });
      }

      const boletim = boletimResult.boletim;
      const totals = await getTotalsForBoletim(boletim._id);
      const totalFaturadoCents = toCents(totals.totalFaturado);
      const totalPagoCents = toCents(totals.totalPago);
      const nextTotalPagoCents = totalPagoCents + toCents(valorResult.value);

      if (totalFaturadoCents === 0) {
        return res.status(409).json({
          msg: "Nao e possivel pagar boletim sem faturamento.",
        });
      }

      if (nextTotalPagoCents > totalFaturadoCents) {
        return res.status(409).json({
          msg: "Total pago nao pode ultrapassar o total faturado.",
        });
      }

      const pagamento = new Pagamento({
        boletimId: boletim._id,
        valorPago: valorResult.value,
        dataPagamento: dataResult.value,
      });

      await pagamento.save();

      const updatedTotals = await getTotalsForBoletim(boletim._id);

      return res.status(201).json({
        msg: "Pagamento lancado com sucesso.",
        pagamento: mapPagamentoResponse(pagamento),
        boletim: mapBoletimResponse(boletim, updatedTotals),
      });
    } catch (error) {
      console.log("createPagamento error", error);
      return res.status(500).json({
        msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
      });
    }
  };

  const listPagamentosByBoletim = async (req, res) => {
    try {
      const profile = await getCurrentUserProfile(req);
      if (!profile.ok) {
        return res.status(profile.status).json({ msg: profile.msg });
      }

      const boletimResult = await getBoletimForLancamento(
        req.params.boletimId,
        profile,
      );

      if (!boletimResult.ok) {
        return res.status(boletimResult.status).json({ msg: boletimResult.msg });
      }

      const pagamentos = await Pagamento.find({
        boletimId: boletimResult.boletim._id,
      }).sort({ dataPagamento: -1, _id: -1 });

      return res.status(200).json(pagamentos.map(mapPagamentoResponse));
    } catch (error) {
      console.log("listPagamentosByBoletim error", error);
      return res.status(500).json({
        msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
      });
    }
  };

  const deletePagamento = async (req, res) => {
    try {
      const profile = await getCurrentUserProfile(req);
      if (!profile.ok) {
        return res.status(profile.status).json({ msg: profile.msg });
      }

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(422).json({ msg: "Pagamento invalido." });
      }

      const pagamento = await Pagamento.findById(req.params.id);

      if (!pagamento) {
        return res.status(404).json({ msg: "Pagamento nao encontrado." });
      }

      const boletimResult = await getBoletimForLancamento(
        pagamento.boletimId,
        profile,
      );

      if (!boletimResult.ok) {
        return res.status(boletimResult.status).json({ msg: boletimResult.msg });
      }

      await Pagamento.findByIdAndDelete(pagamento._id);

      const updatedTotals = await getTotalsForBoletim(boletimResult.boletim._id);

      return res.status(200).json({
        msg: "Pagamento excluido com sucesso.",
        boletim: mapBoletimResponse(boletimResult.boletim, updatedTotals),
      });
    } catch (error) {
      console.log("deletePagamento error", error);
      return res.status(500).json({
        msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
      });
    }
  };

  return {
    createFaturamento,
    listFaturamentosByBoletim,
    deleteFaturamento,
    createPagamento,
    listPagamentosByBoletim,
    deletePagamento,
  };
};

module.exports = createBoletinsLancamentosController;
