import express from "express";

const app = express();
const PORT = 5000;

app.listen(PORT, (error) => {
  if (error) console.log("Error occurred:", error);
  else console.log("Server is running on port:", PORT);
});
