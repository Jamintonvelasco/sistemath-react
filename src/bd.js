// bd.js
import mysql from "mysql2";

export const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root", // o la que uses realmente
  database: "SisteMath",
  port: 3306 // <-- asegúrate de tener este puerto
});

connection.connect((err) => {
  if (err) {
    console.error("❌ Error al conectar con MySQL:", err);
    return;
  }
  console.log("✅ Conectado a MySQL (SisteMath)");
});
