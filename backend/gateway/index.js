import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
//app.use(express.json());

app.use(
  "/api/auth",
  createProxyMiddleware({
    target: "http://auth:5000",
    changeOrigin: true,
    pathRewrite: (path, req) => {
      return "/api/auth" + path.replace("/api/auth", "");
    },
    logLevel: "debug",
  }),
);

app.use(
  "/api/booking",
  createProxyMiddleware({
    target: "http://booking-service:5002",
    changeOrigin: true,
  }),
);

app.get("/", (req, res) => {
  res.send("Gateway is working");
});

app.listen(5000, () => {
  console.log("Gateway running on port 5000");
});
