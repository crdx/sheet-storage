!async function() {
    try {
        const SheetStorage = await require("./storage.js")

        const sheetStorage = new SheetStorage('XXX')

        let username = await sheetStorage.get('username')
        let password = await sheetStorage.get('password')

        sheetStorage.set('randomness', Math.random())

        console.log(username, password)
    } catch (err) {
        console.error(err)
    }
}()
