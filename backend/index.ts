import app from "./src/app";

import connectDb from "./src/config/database";

const PORT = process.env.PORT || 5000;

connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log("Server is up and running on port 5000");
    });
  })
  .catch((err) => {
    console.log("!! MongoDB connection error", err);
    process.exit(1);
  });
