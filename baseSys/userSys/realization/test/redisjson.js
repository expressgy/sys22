const { createClient } =  require('redis');

async function redisJSONDemo() {
    try {
        const TEST_KEY = 'test_node';

        const client = createClient({
            url: 'redis://uair.cc:6379'
        });
        await client.connect();

        await client.json.set('signUpCode','$',{})
        await client.json.set('signUpCode','expressgy',{code:'9527',time:new Date().getTime()})
        await client.json.set('signUpCode','expressnie',{code:'9527',time:new Date().getTime()})
        await client.json.set('signUpCode','admin',{code:'9527',time:new Date().getTime(),name:"何夕"})
        await client.json.set('signUpCode','张良',{code:'9527',time:new Date().getTime(),name:"何夕"})
        const value = await client.json.get('signUpCode');
    // , {
    //         // JSON Path: .node = the element called 'node' at root level.
    //         path: 'pets[0].name',
    //     }

        console.log(value);

        await client.quit();
    } catch (e) {
        console.error(e);
    }
}

redisJSONDemo();