# RONIN 浪人

Sem mestre. Só disciplina. Treino de **boxe, muay thai, jiu-jitsu, MMA e corrida**, força (academia ou calistenia em casa) e nutrição, com base científica. PWA instalável, funciona offline, com conta opcional (e-mail ou Google) pra sincronizar entre aparelhos.

## Módulos
- **Hoje**: calorias e macros restantes, água, treino do dia, peso com tendência, ciência do dia.
- **Nutrição**: TMB + gasto do dia a dia + gasto de cada esporte (METs), meta por objetivo, macros, ajuste adaptativo pelo peso e ingestão reais, alimentos (TACO aprox.).
- **Força**: divisão automática pelo equipamento (academia, halteres, elásticos, barra, peso corporal), progressões de calistenia, ênfase por esporte (pegada no jiu, adutor no muay thai, pliometria na corrida).
- **Esporte**: timer com gongo e voz, gerador de treino por esporte (combinações faladas nas lutas, blocos na corrida), pontos fracos, semana modelo.
- **Técnicas**: biblioteca animada (jab, direto, gancho, uppercut, esquiva, pêndulo, teep, chute, joelhada, sprawl, ponte, fuga de quadril) e "Por que eu canso?".
- **Ciência**: cartas com recomendação, explicação, nível de evidência (A/B/C) e referências.
- **Coach**: IA opcional (chave da API Anthropic no Perfil); sem chave, responde pelas cartas.

## Conta e sincronização
Supabase (mesmo projeto dos outros apps), tabela `ronin_sync`: rode `supabase/001_ronin_sync.sql` uma vez no SQL Editor e adicione a URL do app em Authentication → URL Configuration → Redirect URLs.

## Atualizar
Mude `VERSION` em `sw.js` a cada publicação.

> Não substitui acompanhamento profissional (médico/nutricionista) em caso de condições de saúde.
