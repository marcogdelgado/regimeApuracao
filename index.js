const puppeteer = require('puppeteer');
const { appendFileSync, writeFileSync } = require('fs')
const clientes = require('./src/json/clientes2.json')
let clintesAux = clientes
//const renomeia = require('./src/uteis/rename.js')

appendFileSync('error.csv', 'RAZÃO SOCIAL' + ';' + 'CNPJ' + ';' + 'ERRO' + '\n')

async function main() {
  const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 1920, height: 1080 }, userDataDir: 'C:\\Users\\Admin\\AppData\\Local\\Google\\Chrome\\User Data', executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', slowMo: 20, ignoreDefaultArgs: ["--enable-automation"], args: ["--start-maximized"] });
  const page = await browser.newPage();
  page.setViewport({ width: 1920, height: 1080 })
  await page.goto('https://cav.receita.fazenda.gov.br/autenticacao/login', { waitUntil: 'domcontentloaded' });
  await page._client.send('Page.setDownloadBehavior', {
    downloadPath: 'C:\\trabalho\\robos\\regimeApuracao\\src\\downloads',
    behavior: 'allow'
  })

  try {
    await page.waitForSelector('#login-dados-certificado > p:nth-child(2) > input')   
    await page.click('#login-dados-certificado > p:nth-child(2) > input[type=image]')
    await page.waitForTimeout(2000)
    await page.click('#modal-tips > div > div > button.button-cancel').catch(e => 'sem errro')
    await page.waitForTimeout(2000)
    await page.waitForSelector('#cert-digital > a')
    await page.click('#cert-digital > a')
    await page.waitForTimeout(2000)

    for (let index = 0; index < clientes.length; index++) {
      await page.goto('https://cav.receita.fazenda.gov.br/ecac/Aplicacao.aspx?id=10009&origem=menu', { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(2000)
      console.log('cheguei aqui')
      await page.waitForSelector('#btnPerfil')
      await page.click('#btnPerfil')
      await page.waitForSelector('#txtNIPapel2')
      await page.type('#txtNIPapel2', '00472408000166')//clientes[index]['C'].padStart(14, '0'))
      await page.click('#formPJ > input.submit')
      const valida = await page.$eval('#perfilAcesso > div.erro > p > b', element => element.textContent).catch(e => 'sem errro')
      if (valida === 'ATENÇÃO: ') {
        appendFileSync('error.csv', clientes[index]['B'] + ';' + clientes[index]['C'].padStart(14, '0') + ';' + 'cnpj invalido' + '\n')
        clintesAux.shift()
          (error)
      }
      const msg = await page.$eval('body > div.ui-dialog.ui-widget.ui-widget-content.ui-corner-all.no-close.ui-resizable').catch(e => 'sem errro')
      console.log(msg)
      if (msg) {
        appendFileSync('error.csv', clientes[index]['B'] + ';' + clientes[index]['C'].padStart(14, '0') + ';' + 'Possui mensagem' + '\n')
        clintesAux.shift()
        console.log('cheguei aqui')
          (error)
      } 

      const page2 = await browser.newPage();
      await page2.goto('https://sinac.cav.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgdasd2018.app/RegimeApuracao/Optar', { waitUntil: 'networkidle0' })
      await page2.waitForSelector('#anocalendario')
      await page2.select('#anocalendario', '2022')
      await page2.click('body > div.wrapper > div > div:nth-child(2) > div.col-md-10.col-sm-9 > div.container-fluid > div > div > form > button')
      const verifica = page2.$eval('body > div.wrapper > div > div:nth-child(2) > div.col-md-10.col-sm-9 > div.container-fluid > div > div > form > p', element => element.textContent).catch(e => 'sem errro')
      if (verifica) {
        await page2.click('body > div.wrapper > div > div:nth-child(2) > div.col-md-10.col-sm-9 > div.container-fluid > div > div > form > div:nth-child(2) > label > input[type=radio]')
        await page2.click('#btnContinuarOpcao')
        await page2.click('#btnSimConfirm')
      }
      await page2.waitForSelector('body > div.wrapper > div > div:nth-child(2) > div.col-md-10.col-sm-9 > div.container-fluid > div > div > a')
      await page2.click('body > div.wrapper > div > div:nth-child(2) > div.col-md-10.col-sm-9 > div.container-fluid > div > div > a')

      //renomeia(clientes[index]['B'])

      clintesAux.shift()
      await page2.close()
    }
  } catch (error) {
    await browser.close()
    writeFileSync('./src/json/clientes2.json', JSON.stringify(clintesAux))
    return await main()
  }
};

(async () => await main())()