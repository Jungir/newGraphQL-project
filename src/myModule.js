let str = 'i love myself';
let name = 'Kamil'
// named export

//default export, can have only one of it
const city =  "instanbul"

const getGreeting = (name) => {
    return `hello ${name} we love you`
}
export {str, name, city as default, getGreeting};
