const { createClient } =  require('redis');

async function redisJSONDemo() {
    try {
        const TEST_KEY = 'test_node';

        const client = createClient({
            url: 'redis://uair.cc:6379'
        });
        await client.connect();

        await client.set('4afcef91d5b45a965bcd4ffbd15b3af3','$')
        console.log(await client.get('4afcef91d5b45a965bcd4ffbd15b3af3'))
        console.log(await client.del('a76cb34121b5d327ae28ec56469ef6df9b2c16392bee476a4ea69314d57d36403b568654f53e89b473f631b547c2dd4ddb7d721a2f1192d999010a1fe214422dc67f4d1d5248dd86b3cc0acdeba15a89f8a60063d9e20e8d1f2f5b3777cebda3969e1d5f0cc7d7d920b1ac58617f4d832bf58311d9fd077aa16648f4b17f86bb50a37eefe369bf07d1f8cd624bd1ed6fa8dfb6c732a1487b1dbcd98541e8ce0922ace0050a485a3194d5fa823f3e43a2214ccac8c34362006ef90eae0afa89b9efba3e6902e22bd9a9071d79d46429e5be0fae3c381ff14728665c6435cf3b0d'))

        await client.quit();
    } catch (e) {
        console.error(e);
    }
}

redisJSONDemo();