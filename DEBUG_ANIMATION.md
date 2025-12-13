# Debug da Animação Star Wars - Instruções

## Passos para debugar no Chrome Dev Tools:

1. **Abra o Dev Tools (F12)**
   - Vá para a aba "Elements" (Elementos)
   - Procure pelo elemento com id `sw-crawl`

2. **Verifique se o elemento existe:**
   - No Console, digite: `document.getElementById('sw-crawl')`
   - Deve retornar o elemento, não `null`

3. **Verifique o conteúdo:**
   - No Console, digite: `document.getElementById('sw-crawl').innerHTML`
   - Deve mostrar o HTML do conteúdo do CV
   - Se estiver vazio, o problema é na renderização

4. **Verifique os estilos computados:**
   - Selecione o elemento `sw-crawl` no Elements
   - No painel direito, veja "Computed" (Computado)
   - Verifique:
     - `display`: deve ser `block`
     - `visibility`: deve ser `visible`
     - `opacity`: deve ser `1`
     - `top`: deve ser `100%` inicialmente
     - `animation`: deve mostrar `crawl 120s linear`
     - `transform`: deve mostrar `translateX(-50%) rotateX(35deg) translateZ(0)`

5. **Verifique o container:**
   - Procure pelo elemento `.sw-crawl-container`
   - Verifique:
     - `overflow`: deve ser `visible` (não `hidden`)
     - `height`: deve ter um valor (ex: `100vh`)
     - `position`: deve ser `absolute`

6. **Verifique a animação CSS:**
   - No painel "Styles", procure por `@keyframes crawl`
   - Deve existir e ter os keyframes 0% e 100%

7. **Teste manualmente no Console:**
   ```javascript
   const crawlEl = document.getElementById('sw-crawl');
   console.log('Element:', crawlEl);
   console.log('Computed styles:', window.getComputedStyle(crawlEl));
   console.log('Animation:', window.getComputedStyle(crawlEl).animation);
   console.log('Top:', window.getComputedStyle(crawlEl).top);
   console.log('Transform:', window.getComputedStyle(crawlEl).transform);
   console.log('Display:', window.getComputedStyle(crawlEl).display);
   console.log('Visibility:', window.getComputedStyle(crawlEl).visibility);
   console.log('Opacity:', window.getComputedStyle(crawlEl).opacity);
   ```

8. **Forçar animação manualmente:**
   ```javascript
   const crawlEl = document.getElementById('sw-crawl');
   crawlEl.style.animation = 'none';
   crawlEl.style.top = '100%';
   crawlEl.style.transform = 'translateX(-50%) rotateX(35deg) translateZ(0)';
   void crawlEl.offsetHeight; // force reflow
   crawlEl.style.animation = 'crawl 120s linear';
   ```

9. **Verifique se há erros no Console:**
   - Procure por erros em vermelho
   - Verifique se `renderStarWarsCrawl` está sendo chamada

10. **Verifique a aba "Sources":**
    - Coloque um breakpoint na função `renderStarWarsCrawl`
    - Verifique se a função está sendo executada
    - Verifique os valores das variáveis

## Informações para me passar:

1. O que aparece quando você executa `document.getElementById('sw-crawl')` no Console?
2. Qual é o valor de `innerHTML` do elemento?
3. Quais são os valores computados de `display`, `visibility`, `opacity`, `top`, `animation`?
4. O elemento `.sw-crawl-container` existe e qual é o `overflow` dele?
5. Há algum erro no Console?
6. A função `renderStarWarsCrawl` está sendo chamada? (verifique com breakpoint)

