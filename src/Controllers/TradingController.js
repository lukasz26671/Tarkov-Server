const fs = require('fs');
const ItemParentsList = [
  "5485a8684bdc2da71d8b4567",
  "543be5cb4bdc2deb348b4568",
  "5b3f15d486f77432d0509248",
  "5448e54d4bdc2dcc718b4568",
  "57bef4c42459772e8d35a53b",
  "5447b5fc4bdc2d87278b4567",
  "5447b5f14bdc2d61278b4567",
  "55818add4bdc2d5b648b456f",
  "5a74651486f7744e73386dd1",
  "5448e53e4bdc2d60728b4567",
  "555ef6e44bdc2de9068b457e",
  "5448eb774bdc2d0a728b4567",
  "57864ee62459775490116fc1",
  "55818afb4bdc2dde698b456d",
  "57864ada245977548638de91",
  "55818a6f4bdc2db9688b456b",
  "55818ad54bdc2ddc698b4569",
  "55818acf4bdc2dde698b456b",
  "5f4fbaaca5573a5ac31db429",
  "550aa4af4bdc2dd4348b456e",
  "566162e44bdc2d3f298b4573",
  "5448e8d64bdc2dce718b4568",
  "5448f3a14bdc2d27728b4569",
  "57864a66245977548f04a81f",
  "543be5f84bdc2dd4348b456a",
  "5a341c4686f77469e155819e",
  "550aa4bf4bdc2dd6348b456b",
  "55818b084bdc2d5b648b4571",
  "5448e8d04bdc2ddf718b4569",
  "543be6674bdc2df1348b4569",
  "55818af64bdc2d5b648b4570",
  "5d650c3e815116009f6201d2",
  "550aa4154bdc2dd8348b456b",
  "56ea9461d2720b67698b456f",
  "55802f3e4bdc2de7118b4584",
  "5447bedf4bdc2d87278b4568",
  "55818a104bdc2db9688b4569",
  "5645bcb74bdc2ded0b8b4578",
  "5a341c4086f77401f2541505",
  "57864c322459775490116fbf",
  "5448ecbe4bdc2d60728b4568",
  "55d720f24bdc2d88028b456d",
  "55818ac54bdc2d5b648b456e",
  "54009119af1c881c07000029",
  "57864a3d24597754843f8721",
  "543be5e94bdc2df1348b4568",
  "5c164d2286f774194c5e69fa",
  "5c99f98d86f7745c314214b3",
  "5447e1d04bdc2dff2f8b4567",
  "55818b014bdc2ddc698b456b",
  "55818b0e4bdc2dde698b456e",
  "5671435f4bdc2d96058b4569",
  "566965d44bdc2d814c8b4571",
  "57864e4c24597754843f8723",
  "5447bed64bdc2d97278b4568",
  "5448bc234bdc2d3c308b4569",
  "567849dd4bdc2d150f8b456e",
  "5447b6194bdc2d67278b4567",
  "55802f4a4bdc2ddb688b4569",
  "5448f3ac4bdc2dce718b4569",
  "57864c8c245977548867e7f1",
  "5448f39d4bdc2d0a728b4568",
  "543be5664bdc2dd4348b4569",
  "5448bf274bdc2dfc2f8b456a",
  "5448fe124bdc2da5018b4567",
  "543be5dd4bdc2deb348b4569",
  "55818b224bdc2dde698b456f",
  "5448fe394bdc2d0d028b456c",
  "550aa4dd4bdc2dc9348b4569",
  "5a2c3a9486f774688b05e574",
  "55818ae44bdc2dde698b456c",
  "590c745b86f7743cc433c5f2",
  "5447b5cf4bdc2d65278b4567",
  "55818a684bdc2ddd698b456d",
  "550ad14d4bdc2dd5348b456c",
  "557596e64bdc2dc2118b4571",
  "55818b1d4bdc2d5b648b4572",
  "55818a304bdc2db5418b457d",
  "566168634bdc2d144c8b456c",
  "55818a604bdc2db5418b457e",
  "5447b6094bdc2dc3278b4567",
  "5448fe7a4bdc2d6f028b456b",
  "550aa4cd4bdc2dd8348b456c",
  "5795f317245977243854e041",
  "5447b5e04bdc2d62278b4567",
  "5447b6254bdc2dc3278b4568",
  "55818aeb4bdc2ddc698b456a",
  "5447bee84bdc2dc3278b4569",
  "5447e0e74bdc2d3c308b4567",
  "5661632d4bdc2d903d8b456b",
  "566abbb64bdc2d144c8b457d",
  "567583764bdc2d98058b456e",
  "5448f3a64bdc2d60728b456a",
  "55818a594bdc2db9688b456a",
  "55818b164bdc2ddc698b456c",
  "5d21f59b6dbe99052b54ef83",
  "543be6564bdc2df4348b4568",
  "57864bb7245977548b3b66c2",
  "5448e5284bdc2dcb718b4567",
  "5448e5724bdc2ddf718b4568",
  "5422acb9af1c889c16000029",
];

class TradingController {
    static Instance = new TradingController();
    static ItemDbList = [];

    static iterItemChildren(item, item_list) {
        // Iterates through children of `item` present in `item_list`
        return item_list.filter((child_item) => child_item.parentId === item._id);
      }
    
      static iterItemChildrenRecursively(item, item_list) {
        // Recursively iterates through children of `item` present in `item_list`
      
        let stack = TradingController.iterItemChildren(item, item_list);
        let child_items = [...stack];
      
        while (stack.length > 0) {
          let child = stack.pop();
          let children_of_child = TradingController.iterItemChildren(child, item_list);
          stack.push(...children_of_child);
          child_items.push(...children_of_child);
        }
      
        return child_items;
      }

    static generateItemIds(...items) {
        const ids_map = {};
      
        for (const item of items) {
          ids_map[item._id] = utility.generateNewItemId();
        }
      
        for (const item of items) {
          item._id = ids_map[item._id];
          if (item.parentId in ids_map) {
            item.parentId = ids_map[item.parentId];
          }
        }
    }

    static generateFenceAssort() {
        const fenceId = "579dc571d53a0658a154fbec";
        const base = { items: [], barter_scheme: {}, loyal_level_items: {} };
      
        // Read in default/base Assort (this is using proper dumped assort from live, not the JET hack version)
        global._database.traders[fenceId].assort = base;
        /**
         * {}
         */
        const fileAssort = JSON.parse(fs.readFileSync(process.cwd() + "/db/traders/579dc571d53a0658a154fbec/assort.json"));

         for (let i = 0; i < 100; i++) {
            let random_item_index = utility.getRandomInt(
              0,
              fileAssort.items.length - 1
            );

            const random_item = JSON.parse(JSON.stringify(fileAssort.items[random_item_index]));
            console.log(random_item);
            let random_item_children = TradingController.iterItemChildrenRecursively(
                random_item,
                fileAssort.items
              );

            if(base.items.findIndex(x=>x._id === random_item._id) !== -1)
              continue;

            if(ItemParentsList.findIndex(x=>x === random_item._id) !== -1)
              continue;

            if(ItemParentsList.findIndex(x=>x === random_item._tpl) !== -1)
              continue;

            if(random_item["upd"] !== undefined && random_item["upd"]["StackObjectsCount"] !== undefined) {
              random_item["upd"].StackObjectsCount = 1;
              random_item["upd"].UnlimitedCount = false
            }

            base.items.push(random_item);

            let item_price = helper_f.getTemplatePrice(random_item._tpl);
            for (const child_item of random_item_children) {
              item_price += helper_f.getTemplatePrice(child_item._tpl);
            }
            if(item_price <= 1)
              continue;

            console.log(item_price);

            base.barter_scheme[random_item._id] = [
                      [
                        {
                          count: Math.round(item_price),
                          _tpl: "5449016a4bdc2d6f028b456f", // Rubles template
                        },
                      ],
                    ];
            base.loyal_level_items[random_item._id] = 1;
        }

      }
}

module.exports.TradingController = TradingController;