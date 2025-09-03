// funcao para gerar o arquivo em Execel para adicionar notas dos competidores
import excelJS from 'exceljs';
import db from '../config/db.js';

export const exportPlanilhaLutas = async (req, res) => {
  try {
    // Consulta para buscar todas as lutas com competidores, notas e punições
    const query = `
      SELECT 
        l.id as luta_id,
        ce.nome as competidor_esq,
        cd.nome as competidor_dir,
        r.numero as rodada,
        cat.nome as categoria,
        GROUP_CONCAT(DISTINCT 
          CASE WHEN p_esq.competidor_id IS NOT NULL THEN p_esq.descricao || ' (-' || p_esq.pontos_descontados || ')' END
        ) as punicoes_esq,
        GROUP_CONCAT(DISTINCT 
          CASE WHEN p_dir.competidor_id IS NOT NULL THEN p_dir.descricao || ' (-' || p_dir.pontos_descontados || ')' END
        ) as punicoes_dir,
        GROUP_CONCAT(DISTINCT 
          CASE WHEN n.tipo = 'luta' THEN n.valor END
        ) as notas_gerais
      FROM luta l
      INNER JOIN competidor ce ON l.competidor_esq_id = ce.id
      INNER JOIN competidor cd ON l.competidor_dir_id = cd.id
      INNER JOIN rodada r ON l.rodada_id = r.id
      INNER JOIN categoria cat ON r.categoria_id = cat.id
      LEFT JOIN punicao p_esq ON l.id = p_esq.luta_id AND p_esq.competidor_id = ce.id
      LEFT JOIN punicao p_dir ON l.id = p_dir.luta_id AND p_dir.competidor_id = cd.id
      LEFT JOIN nota n ON l.id = n.luta_id
      GROUP BY l.id
      ORDER BY r.numero, l.id
    `;

    db.all(query, [], async (err, rows) => {
      if (err) {
        console.error('Erro na consulta:', err);
        return res.status(500).json({ error: 'Erro ao buscar dados das lutas' });
      }

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Nenhuma luta encontrada' });
      }

      const workbook = new excelJS.Workbook();
      const worksheet = workbook.addWorksheet('Lutas');

      // Definir colunas
      worksheet.columns = [
        { header: 'Competidor A', key: 'competidor_esq', width: 25 },
        { header: 'Punição A', key: 'punicoes_esq', width: 15 },
        { header: 'Nota 1', key: 'nota1', width: 10 },
        { header: 'Nota 2', key: 'nota2', width: 10 },
        { header: 'Nota 3', key: 'nota3', width: 10 },
        { header: 'Punição B', key: 'punicoes_dir', width: 15 },
        { header: 'Competidor B', key: 'competidor_dir', width: 25 },
        { header: 'Rodada', key: 'rodada', width: 10, hidden: true }, // Coluna oculta para referência
        { header: 'Categoria', key: 'categoria', width: 15, hidden: true } // Coluna oculta para referência
      ];

      // Adicionar dados
      rows.forEach(luta => {
        // Dividir notas gerais (assumindo que são 3 notas)
        const notas = luta.notas_gerais ? luta.notas_gerais.split(',') : ['', '', ''];

        worksheet.addRow({
          competidor_esq: luta.competidor_esq,
          punicoes_esq: luta.punicoes_esq || '0', // Mostra 0 se não houver punição
          nota1: notas[0] || '',
          nota2: notas[1] || '',
          nota3: notas[2] || '',
          punicoes_dir: luta.punicoes_dir || '0', // Mostra 0 se não houver punição
          competidor_dir: luta.competidor_dir,
          rodada: luta.rodada,
          categoria: luta.categoria
        });
      });

      // Estilizar cabeçalhos
      const headerRow = worksheet.getRow(1);
      headerRow.eachCell((cell) => {
        cell.font = { 
          bold: true, 
          color: { argb: 'FFFFFFFF' },
          size: 12
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF2F5496' } // Azul escuro
        };
        cell.alignment = { 
          vertical: 'middle', 
          horizontal: 'center',
          wrapText: true
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
      });

      // Estilizar células de notas (centralizar)
      const notasColumns = ['C', 'D', 'E'];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          notasColumns.forEach(col => {
            const cell = row.getCell(col);
            cell.alignment = { horizontal: 'center' };
            // Adicionar validação para notas entre 0 e 10
            cell.dataValidation = {
              type: 'decimal',
              operator: 'between',
              formulae: [0, 10],
              showErrorMessage: true,
              errorTitle: 'Nota inválida',
              error: 'A nota deve estar entre 0 e 10'
            };
          });

          // Destacar células com punições
          const punicaoACell = row.getCell('B');
          const punicaoBCell = row.getCell('F');
          
          if (punicaoACell.value !== '0') {
            punicaoACell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFF0000' } // Vermelho para punição
            };
            punicaoACell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
          }

          if (punicaoBCell.value !== '0') {
            punicaoBCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFF0000' } // Vermelho para punição
            };
            punicaoBCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
          }
        }
      });

      // Configurar headers para download
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="planilha_lutas.xlsx"'
      );

      // Enviar arquivo
      await workbook.xlsx.write(res);
      res.end();
    });
  } catch (error) {
    console.error('Erro ao gerar planilha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};