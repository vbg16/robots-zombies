# Armas empunhadas — BUILD46

player-weapons.js é um renderer clássico local sem downloads, RNG ou dependências. Doze silhuetas e paletas originais distinguem metralhadora, escopeta dupla, rajada, sniper com mira longa, laser, lança-chamas com tanque, criogênica com aletas, foguete tubular, tambor de granadas, Tesla com garfos, disco e arpão.

A chamada fica após o robô e antes dos drones. Ângulo usa a mira manual do mundo; o espelhamento mantém punhos embaixo quando aponta à esquerda. O modelo recebe pose por valor e não altera o jogador. weaponKick é criado/zerado no reset, ativado só após emissão efetiva e reduzido apenas pelo tick em combate. A recarga usa a fração restante existente, sem modificar seu relógio. Alfa acompanha o feedback de dano.

Regras: manter equipamento fixo da garagem, nunca criar tiros no draw, não usar RNG, não consumir munição nem mudar trajetória/hitbox no renderer, congelar gestos na pausa, restaurar contexto após desenho, preservar fallback quando renderer ausente. As mãos são estilizadas e o prop gira sobre o torso; não há IK de braços neste estágio.

Validação: node tests/player-weapons.cjs (12assinaturas únicas, quatro direções, estado de pose intacto, recarga/recuo, pausa/reset e tiro cancelado); Chrome tests/player-weapons-browser.cjs (12equipamentos na arena, mira esquerda/direita e recuo); regressões audio-gameplay, build-mechanics e18cenários spatial-runtime. Capturas locais outputs/player-weapons/contact.png e cada arma. Contact sheet e Tesla em cenário inspecionados visualmente. HTTP/file e fallbacks do PROT também foram revalidados após carregar o novo script.
