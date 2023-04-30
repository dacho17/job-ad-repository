cd db-interface-client
npm install

export NODE_OPTIONS="--optimize_for_size --max_old_space_size=2560 --gc_interval=100"

npm run build

npm install -g serve

cd build

serve -s
