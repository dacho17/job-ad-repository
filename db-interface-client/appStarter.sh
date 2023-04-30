cd db-interface-client
npm install

export NODE_OPTIONS="--max_old_space_size=2560"

npm run build

npm install -g serve

cd build

serve -s
