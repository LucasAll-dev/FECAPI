import db from '../config/db.js';
import PDFDocument from "pdfkit";

// Gerar súmula de uma rodada
export const gerarSumulaRodada = (req, res) => {
  const { rodadaId } = req.params;

  // 1️⃣ Buscar informações da rodada + categoria
  const rodadaQuery = `
    SELECT r.id, r.numero, c.nome AS categoria, camp.nome AS campeonato
    FROM rodada r
    JOIN categoria c ON r.categoria_id = c.id_categoria
    JOIN campeonato camp ON r.campeonato_id = camp.id
    WHERE r.id = ?;
  `;

  db.get(rodadaQuery, [rodadaId], (err, rodada) => {
    if (err || !rodada) {
      return res.status(500).json({ error: "Erro ao buscar rodada" });
    }

    // 2️⃣ Buscar lutas e competidores da rodada
    const lutasQuery = `
      SELECT 
        l.id AS luta_id,
        l.rodada_id,
        ce.id_competidores AS atleta1_id,
        ce.nome AS atleta1_nome,
        cd.id_competidores AS atleta2_id,
        cd.nome AS atleta2_nome
      FROM luta l
      JOIN competidores ce ON ce.id_competidores = l.competidor_esq_id
      JOIN competidores cd ON cd.id_competidores = l.competidor_dir_id
      WHERE l.rodada_id = ?;
    `;

    db.all(lutasQuery, [rodadaId], (err, lutas) => {
      if (err) {
        return res.status(500).json({ error: "Erro ao buscar lutas" });
      }

      // 3️⃣ Criar PDF
      const doc = new PDFDocument({ margin: 40, size: "A4" });

      // Header de resposta HTTP para download
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=sumula_rodada_${rodada.numero}.pdf`
      );

      doc.pipe(res);

      // ------------------- CABEÇALHO -------------------
      doc.font("Helvetica-Bold").fontSize(18).text("JOGOS DE CAPOEIRA", { align: "center" });
      doc.moveDown(0.5);
      doc.font("Helvetica").fontSize(12).text("Relação de Jogos por Categoria", { align: "center" });
      doc.moveDown(1);

      doc.fontSize(10).text(`Campeonato: ${rodada.campeonato}`, { align: "left" });
      doc.text(`Categoria: ${rodada.categoria}`, { align: "left" });
      doc.text(`Rodada: ${rodada.numero}`, { align: "left" });
      doc.text("OBS.: Notas de 0 a 10", { align: "left" });

      doc.moveDown(1);

      // ------------------- TABELA -------------------
      let y = 160;
      doc.font("Helvetica-Bold").fontSize(11);

      // Cabeçalho da tabela
      doc.text("Rodada", 50, y);
      doc.text("Atleta", 120, y);
      doc.text("Juiz 1", 250, y);
      doc.text("Juiz 2", 300, y);
      doc.text("Atleta", 360, y);
      doc.text("Juiz de Jogo", 490, y);

      y += 20;
      doc.moveTo(50, y).lineTo(550, y).stroke();

      // Linhas da tabela
      doc.font("Helvetica").fontSize(10);
      lutas.forEach((jogo) => {
        y += 20;
        doc.text(rodada.numero, 60, y);
        doc.text(jogo.atleta1_nome, 120, y);
        doc.text("____", 250, y); // espaço juiz1
        doc.text("____", 300, y); // espaço juiz2
        doc.text(jogo.atleta2_nome, 360, y);
        doc.text("Nota: ____", 490, y);
      });

      y += 40;

      // ------------------- RODAPÉ -------------------
      doc.font("Helvetica-Bold").text(`Total de Jogos: ${lutas.length}`, 50, y);
      y += 20;
      doc.font("Helvetica").fontSize(9).text(
        "Legenda: Rodada 1 = ______  Rodada 2 = ______  Rodada 3 = ______",
        50,
        y
      );

      doc.end();
    });
  });
};
