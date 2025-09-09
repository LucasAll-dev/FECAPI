import "./styles.css";
import { Routes, Route } from "react-router-dom";
import Competidores from "../../layouts/competidores/Competidores";
import Categoria from "../../layouts/categoria/categoria";
import Campeonato from "../../layouts/campeonato/Campeonatos";
import CampeonatoDetalhes from "../../layouts/campeonato/CampeonatoDetalhes";
import Inicio from "../../layouts/inicio/Inicio";
import Relatorio from "../../layouts/relatorio/Relatorio";
import Menu from "../../components/menu/Menu";

console.log("CampeonatoDetalhes importado:", CampeonatoDetalhes);

function Home() {
    return (
        <main className="container-main">
            <Menu />
            <div id='container-dinamico'>
                {/*
                  ✅✅✅ IMPORTANTE: Usar rotas RELATIVAS
                  Como a rota pai é "/home/*", aqui usamos paths relativos:
                  
                  URL completa → Componente
                  /home/ → Inicio
                  /home/competidores → Competidores  
                  /home/categoria → Categoria
                  /home/campeonato → Campeonato
                  /home/relatorios → Relatorio
                */}
                <Routes>
                    <Route path="/" element={<Inicio />} />
                    <Route path="/competidores" element={<Competidores />} />
                    <Route path="/categoria" element={<Categoria />} />
                    <Route path="/campeonato/:id" element={<CampeonatoDetalhes />} />
                    <Route path="/campeonato" element={<Campeonato />} />
                    <Route path="/relatorios" element={<Relatorio />} />
                    
                    {/* Rota para páginas não encontradas DENTRO do home */}
                    <Route path="*" element={
                        <div style={{ padding: '20px' }}>
                            <h3>Página não encontrada</h3>
                            <p>A seção solicitada não existe.</p>
                        </div>
                    }/>
                </Routes>
            </div>
        </main>
    )
}

export default Home;