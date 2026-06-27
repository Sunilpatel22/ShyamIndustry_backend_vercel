module.exports = {
  apps: [{
    name: "shyam-backend",
    script: "./server.js",
    env: {
      PORT: 8080,
      NODE_ENV: "production",
      MONGODB_URI: "mongodb+srv://sunilkumarpatel7985_db:SunilPatel2322@cluster0.ay7lf00.mongodb.net/shyam_industries?appName=Cluster0",
      JWT_SECRET: "prod_high_security_secret_9988",
      SECRET_PASSKEY: "ShyamAdminProd2026",
      CLIENT_URL: "https://shyamindustries.vercel.app"
    }
  }]
}
