import { Server } from "socket.io";

import ProductDaoMongoDB from "./daos/mongodb/product.dao.js";
const prodDao = new ProductDaoMongoDB();

// import { __dirname } from "./utils.js";
// import ProductDaoFS from "./daos/filesystem/product.dao.js";
// const prodDao = new ProductDaoFS(
//   __dirname + "/daos/filesystem/data/products.json"
// );

export function configureWebSocket(httpServer) {
  const io = new Server(httpServer);

  io.on("connection", async (socket) => {
    console.log(`🟢 User connected ${socket.id}`);

    try {
      const products = await prodDao.getProducts();
      socket.emit("updateProducts", products);
    } catch (error) {
      console.error("Error fetching products:", error);
    }

    socket.on("addProduct", async (productData) => {
      try {
        const newProduct = await prodDao.createProduct(productData);
        if (newProduct) {
          const updatedProducts = await prodDao.getProducts();
          io.emit("updateProducts", updatedProducts);
        } else {
          socket.emit("productCreationFailed", "Failed to create the product.");
        }
      } catch (error) {
        console.error("Error adding a new product:", error);
        socket.emit("productCreationFailed", "Failed to create the product.");
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔴 User disconnected ${socket.id}`);
    });
  });
}
