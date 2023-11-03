import { pool } from "../db.js";

export const getItemid = async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM empleado WHERE id=?", [
    req.params.id,
  ]);
  console.log(rows);
  if (rows.length <= 0) return res.send("Empledo no encontrado");

  res.json(rows[0]);
};

//llamar a varios items
export const getItem = async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM color_n");
  res.json(rows);
};

//crear datos POST
export const postItem = async (req, res) => {
  const { cod_tipo_, color, estado_color, codigo_color } = req.body;
  const [rows] = await pool.query(
    "INSERT INTO color_n (cod_tipo_,color,estado_color,codigo_color) VALUES (?,?,?,?)",
    [cod_tipo_, color, estado_color, codigo_color]
  );
  res.send({
    cod_color: rows.insertId,
    cod_tipo_,
    color,
    estado_color,
    codigo_color,
  });
};

export const putItem = (req, res) => {
  res.send("Actualizar item");
};

export const deleteItem = (req, res) => {
  res.send("Eliminar item");
};
