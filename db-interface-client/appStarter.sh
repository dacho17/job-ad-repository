cd db-interface-client
npm install
NODE_OPTIONS=--max_old_space_size=1024
npm run build

npm install serve

cd build

serve -s
