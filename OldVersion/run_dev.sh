cd ./server
pm2 start ecosystem.config.js &
cd ../client
npm start