import db from '../config/db.js';

import PDFDocument from "pdfkit";

export const gerarSumula = (req, res) => {
  const { rodadaId } = req.params;

  try {
    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=sumula_rodada_${rodadaId}.pdf`);
    doc.pipe(res);

    // Buscar info da rodada + campeonato
    const rodadaSQL = `
      SELECT r.id, r.numero, c.nome AS campeonato
      FROM rodada r
      JOIN campeonato c ON r.campeonato_id = c.id
      WHERE r.id = ?
    `;

    db.get(rodadaSQL, [rodadaId], (err, rodada) => {
      if (err || !rodada) {
        res.status(404).send("Rodada não encontrada");
        return;
      }

      // Cabeçalho
      doc.fontSize(20).text(`Súmula - ${rodada.campeonato}`, { align: "center" });
      doc.fontSize(14).text(`Rodada ${rodada.numero}`, { align: "center" });
      doc.moveDown(2);

      // Buscar lutas dessa rodada
      const lutaSQL = `
        SELECT l.id AS luta_id, 
               ce.nome AS competidor_esq, 
               cd.nome AS competidor_dir
        FROM luta l
        JOIN competidores ce ON ce.id_competidores = l.competidor_esq_id
        JOIN competidores cd ON cd.id_competidores = l.competidor_dir_id
        WHERE l.rodada_id = ?
      `;

      db.all(lutaSQL, [rodadaId], (err, lutas) => {
        if (err) {
          res.status(500).send("Erro ao buscar lutas");
          return;
        }

        let y = 120;

        lutas.forEach((luta, index) => {
          doc.fontSize(14).text(`Luta ${index + 1}`, 50, y);
          y += 20;

          [ { lado: "Esquerda", nome: luta.competidor_esq }, 
            { lado: "Direita", nome: luta.competidor_dir } 
          ].forEach((competidor) => {
            doc.fontSize(12).text(`${competidor.lado}: ${competidor.nome}`, 60, y);
            y += 20;

            // Buscar notas (limitando a 3)
            const notaSQL = `
              SELECT valor FROM nota 
              WHERE luta_id = ? AND competidor_id = (
                SELECT id_competidores FROM competidores WHERE nome = ?
              ) LIMIT 3
            `;
            db.all(notaSQL, [luta.luta_id, competidor.nome], (err, notas) => {
              const notasTxt = notas.map(n => n.valor).join(" | ") || "____ | ____ | ____";
              doc.text(`Notas: ${notasTxt}`, 80, y);
              y += 20;
            });

            // Buscar punições
            const puniSQL = `
              SELECT descricao FROM punicao 
              WHERE luta_id = ? AND competidor_id = (
                SELECT id_competidores FROM competidores WHERE nome = ?
              )
            `;
            db.all(puniSQL, [luta.luta_id, competidor.nome], (err, punicoes) => {
              const puniTxt = punicoes.map(p => p.descricao).join(", ") || "Nenhuma";
              doc.text(`Punição: ${puniTxt}`, 80, y);
              y += 30;
            });
          });

          y += 20;
        });

        // Finalizar PDF
        setTimeout(() => doc.end(), 500); // delay pequeno p/ consultas async
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao gerar súmula");
  }
};
