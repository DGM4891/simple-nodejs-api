import express from 'express';
import fs from "fs";
import bodyParser from "body-parser";
import request from 'request';
import soap from 'soap';
import xmlJs from 'xml-js';

const app = express();
const PORT = 3000; // Choose your desired port

// Middleware to parse JSON bodies
app.use(bodyParser.json());

const readData = () => {
    try
    {
        const data = fs.readFileSync("./db.json");
        return JSON.parse(data);
    }
    catch (error)
    {
        console.log(error);
    }    
};

const writeData = (data) => {
    try
    {
        fs.writeFileSync("./db.json", JSON.stringify(data));
    }
    catch (error)
    {
        console.log(error);
    }    
};

app.get("/", (req, res) => {
    res.send(".:Welcome to my first API with Node js:.");
});

app.get("/books", (req, res) => {
    const data = readData();
    res.json(data.books);
});

app.get("/books/:id", (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    const book = data.books.find((book) => book.id === id);
    res.json(book);
});

app.post("/books", (req, res) => {
    const data = readData();
    const body = req.body;
    const newBook = {
        id: data.books.length + 1,
        ...body,
    }
    data.books.push(newBook);
    writeData(data);
    res.json(newBook);
});

app.post("/getData/:cedula", async (req, res) => {
    const cedula = req.params.cedula;

    try {
        // Create a SOAP client
        const client = await soap.createClientAsync('http://test.citas.med.ec:8082/Preprod/WsBsgRegistroCivil/WcfBsgRegCivil.svc?wsdl');
        
        // SOAP request parameters
        const args = {
            identificacion: cedula
        };

        // Make SOAP request
        const result = await client.BusquedaPorNuiAsync(args);

        res.json(result[0].BusquedaPorNuiResult);
        // // Convert XML response to JSON
        // const jsonResult = soapResponseToJson(result[0]);

        // // Send JSON response
        // res.json(jsonResult);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Function to convert XML SOAP response to JSON
function soapResponseToJson(xml) {
    // Logic to convert XML to JSON (You may use libraries like xml-js)
    // For simplicity, let's assume xml-js library is used
    const json = xmlJs.xml2json(xml, { compact: true, spaces: 4 });
    return JSON.parse(json);
}

app.put("/books/:id", (req, res) => {
    const data = readData();
    const body = req.body;
    const id = parseInt(req.params.id);
    const bookIndex = data.books.findIndex((book) => book.id === id);
    data.books[bookIndex] = {
        ...data.books[bookIndex],
        ...body
    }    
    writeData(data);
    res.json({ message: "Book update successfully" });
});

app.delete("/books/:id", (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    const bookIndex = data.books.findIndex((book) => book.id === id);
    data.books.splice(bookIndex, 1);
    writeData(data);
    res.json({ message: "Book delete successfully" });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
 });