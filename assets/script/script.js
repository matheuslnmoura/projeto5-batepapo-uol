let messages = [];
let messagesPromise = axios.get('https://mock-api.driven.com.br/api/v4/uol/messages');

messagesPromise.then(createChatInterface);
messagesPromise.catch(displayLoadingErrorMessage);


function createChatInterface(messagesPromiseResponse) {
    messagesObject = messagesPromiseResponse.data
    document.querySelector('.chat-area .loading').classList.add('no-display');
    messagesObject.map((item) => {
        document.querySelector('.chat-area').innerHTML +=
        `
        <div class="message ${item.type}" data-identifier = "message">
            <div class="container">
                <span class="time-stamp">${item.time} </span>
                <span class="user-name"><b>${item.from}</b> </span>
                <span class="addressing">para <b>${item.to}</b></span>
                <span class="message-text">${item.text}</span>
            </div>
        </div>
        `;

    });


}

function displayLoadingErrorMessage(messagesPromiseResponse) {
    document.querySelector('.chat-area .loading').innerHTML = 
    `
        Erro: Não foi possível carregar as mensagens :(
    `
}



function showSideMenu() {
    document.querySelector('aside').classList.add('right-transition');
    setTimeout(()=>{
        document.querySelector('.site-overlay').classList.add('overlay-bg');
    }, 200);
}

function hideSideMenu() {
    document.querySelector('aside').classList.toggle('right-transition');
}

function verifyUserLogin() {
    let userObject = {name: document.querySelector('.login-screen input').value};
    let loginPromise = axios.post('https://mock-api.driven.com.br/api/v4/uol/participants', userObject);

    loginPromise.then(enterTheChatRoom);
    loginPromise.catch(userNameAlreadyInUse)
}

function enterTheChatRoom() {
    document.querySelector('.login-screen').classList.add('no-display');
    document.querySelector('.site-container').classList.remove('no-display');
}

function userNameAlreadyInUse() {
    let userName = document.querySelector('.login-screen input').value
    document.querySelector('.login-error-modal').classList.remove('no-display');
    setTimeout(()=>{
        document.querySelector('.login-error-modal').classList.add('opacity-control-on');
    }, 100);

    if (userName === '') {
        document.querySelector('.login-error-modal').innerHTML = 'Campo de nome de usuário obrigatório'
    } else {
        document.querySelector('.login-error-modal').innerHTML = `O nome ${userName} já está em uso. Por favor, escolha outro nome.`
    }

    document.querySelector('.login-screen').addEventListener('click', ()=>{
        document.querySelector('.login-error-modal').classList.remove('opacity-control-on');

        setTimeout(()=>{
            document.querySelector('.login-error-modal').classList.add('no-display');
            location.reload();
        }, 800);

        
    })
}



document.querySelector('.login-screen button').addEventListener("click", verifyUserLogin);

document.querySelector('.site-overlay').addEventListener("click", hideSideMenu);

document.querySelector('header .container button').addEventListener("click", showSideMenu);