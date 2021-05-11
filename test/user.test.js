let app = require("../src/app");
let supertest = require("supertest");
let request = supertest(app);

let mainUser = {name: "Victor Lima", email: "victor@guia.com", password: "123456"}
//o código aqui será rodado antes de tudo, neste caso, a criação de usuário
beforeAll(() => {
    return request.post("/user")
    .send(mainUser)
    .then(res => {})
    .catch(err => {console.log(err)})
})

//o código aqui será rodando depois de tudo, neste caso, para remover o usuário testado
afterAll(() => {
    return request.delete(`/user/${mainUser.email}`)
    .then(res => {})
    .catch(err => {console.log(err)})
})


/*
//o código aqui será rodado antes de cada teste
beforeEach(() => {

})

//o código aqui será rodado após cada teste
beforeEach(() => {

})
*/

describe("Cadastro de usuário ", () => {
    test("Deve cadastrar um usuário com sucesso",() => {

        let time = Date.now();
        let email = `${time}@gmail.com`;
        let user = {name: "Victor", email, password: "123456"};

        return request.post("/user")
        .send(user)
        .then(res => {

            expect(res.statusCode).toEqual(200);
            expect(res.body.email).toEqual(email);

        }).catch(err => {
            fail(err);
        })
    })


    test("Deve impedir que um usuário se cadastre com os dados vazios",() => {

        let user = {name: "", email: "", password: ""};
        return request.post("/user")
        .send(user)
        .then(res => {
            expect(res.statusCode).toEqual(400);
        }).catch(err => {
            fail(err);
        })

    })

    test("Deve impedir que um usuário se cadastre com um e-mail repetido", () => {
        
        let time = Date.now();
        let email = `${time}@gmail.com`;
        let user = {name: "Victor", email, password: "123456"};

        return request.post("/user") // primeira requisição é esperado que o usuário seja cadstrado com sucesso!
        .send(user)
        .then(res => {
            expect(res.statusCode).toEqual(200);
            expect(res.body.email).toEqual(email);


           return request.post("/user") //segunda requisicao, resposta diferente, um "erro"
            .send(user)
            .then(res => {

                expect(res.statusCode).toEqual(400);
                expect(res.body.error).toEqual("E-mail já cadastrado");

            }).catch(err => {
                fail(err);
            })

        }).catch(err => {
            fail(err);
        })
    })
})


describe("Autenticação", () => {
    test("Deve me retornar um token quando logar" , () => {
        return request.post("/auth")
        .send({email: mainUser.email, password: mainUser.password})
        .then(res => {
            expect(res.statusCode).toEqual(200);
            //token retornado nao seja vazio
            expect(res.body.token).toBeDefined();
        }).
        catch(err => {
            fail(err)
        })
    })

    test("Deve impedir que um usuário não cadastrado se logue", () => {
        return request.post("/auth")
        .send({email: "jfdsklfsdfsldk@gmail.com", password: "2312321"})
        .then(res => {
            expect(res.statusCode).toEqual(403);
            expect(res.body.errors.email).toEqual("E-mail não cadastrado")
        })
        .catch(err => {
            fail(err);
        })
    })

    
    test("Deve impedir que um usuário se logue com uma senha errada", () => {
        return request.post("/auth")
        .send({email: mainUser.email, password: "bolinha"})
        .then(res => {
            expect(res.statusCode).toEqual(403);
            expect(res.body.errors.password).toEqual("Senha incorreta")
        })
        .catch(err => {
            fail(err);
        })
    })


})