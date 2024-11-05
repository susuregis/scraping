const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');

async function scrapeBooks() {
    const url = 'http://books.toscrape.com/';
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

  
    await page.goto(url, { waitUntil: 'networkidle2' });

    
    await page.waitForSelector('.product_pod');

    // Extrair os dados dos livros
    const livros = await page.evaluate(() => {
        const itens = [];
        document.querySelectorAll('.product_pod').forEach(livro => {
            const titulo = livro.querySelector('h3 a').getAttribute('title') || 'Título não encontrado';
            const preco = livro.querySelector('.price_color')?.innerText || 'Preço não encontrado';
            itens.push({ titulo, preco });
        });
        return itens;
    });


    await browser.close();

    let emailContent = '<h1>Livros Encontrados</h1><ul>';
    livros.forEach(livro => {
        emailContent += `<li><strong>${livro.titulo}</strong> - ${livro.preco}</li>`;
    });
    emailContent += '</ul>';

   
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'seu-email@gmail.com', 
            pass: 'sua-senha',           
        },
    });

  
    const mailOptions = {
        from: 'seu-email@gmail.com',
        to: 'destinatario@example.com', 
        subject: 'Lista de Livros e Preços',
        html: emailContent,
    };

    
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.error('Erro ao enviar o e-mail:', error);
        }
        console.log('E-mail enviado:', info.response);
    });
}


scrapeBooks();
