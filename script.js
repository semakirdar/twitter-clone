let homePage = document.getElementById('homePage');
let loginPage = document.getElementById('loginPage');
let inputEmailLogin = document.getElementById('inputEmailLogin');
let passwordLogin = document.getElementById('passwordLogin');
let btnLogin = document.getElementById('btnLogin');
let registerPage = document.getElementById('registerPage');
let goLogin = document.getElementById('goLogin');
let goRegister = document.getElementById('goRegister');
let registerForm = document.getElementById('registerForm');
let message = document.getElementById('message');
let loginForm = document.getElementById('loginForm');
let tweetsEl = document.getElementById('tweets');
let sendTweet = document.getElementById('sendTweet');
let inputTweet = document.getElementById('inputTweet');
let notificationEl = document.getElementById('notification');
let peoplesEl = document.getElementById('peoples');
let peoplesRefresh = document.getElementById('peoplesRefresh');
let logout = document.getElementById('logout');
let loader = document.getElementById('loader');
let tweetDelete = document.getElementById('tweetDelete');
let userUpdate = document.getElementById('userUpdate');
let userModal = document.getElementById('userModal');
let modalUpdate = document.getElementById('modalUpdate');
let profilUpdate = document.getElementById('profilUpdate');

let apiBaseUrl = 'http://127.0.0.1:8000/';

goRegister.addEventListener('click', function () {
    loginPage.style.display = 'none';
    registerPage.style.display = 'flex';
});

goLogin.addEventListener('click', function () {
    registerPage.style.display = 'none';
    loginPage.style.display = 'flex';
});

registerForm.addEventListener('submit', function (e) {
    e.preventDefault();
    let formData = new FormData(this);
    axios.post(apiBaseUrl + 'api/register', formData)
        .then(function (data) {
            console.log(data);
            //HTTP CODE 200 ise then içine girer
            if (data.data.success == true) {
                message.innerHTML = data.data.message;
            }
        })
        .catch(function (error) {
            if (error.response.status == 422) {
                //validation hataları

                printValidationError(error.response.data.errors);
            }
        });
    console.log('form submitted');
});

loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    let formData = new FormData(this);

    axios.post(apiBaseUrl + 'api/login', formData)
        .then(function (data) {
            if (data.data.success == true) {
                homePage.style.display = 'block';
                loginPage.style.display = 'none';
                registerPage.style.display = ' none';
                localStorage.setItem('token', data.data.token);
                localStorage.setItem('user', JSON.stringify(data.data.user));

                getData();
            }

        })
        .catch(function (error) {
            if (error.response.status == 422) {
                printValidationError(error.response.data.errors);
            }
        });
});

sendTweet.addEventListener('click', function () {
    let body = inputTweet.value;
    inputTweet.value = '';
    axios.post(apiBaseUrl + 'api/tweets', {
        body: body
    }, {
        headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}
    })
        .then(function (data) {
            if (data.data.success) {
                getTweets();
            }
        })
        .catch(function (error) {
            if (error.response.status == 422) {
                printValidationError(error.response.data.errors);
            }
        });
});

peoplesRefresh.addEventListener('click', function () {
    printPeoples();

});

function printValidationError(errors) {
    notificationEl.style.display = 'block';
    Object.keys(errors).forEach(function (item, i) {
        errors[item].forEach(function (item2, i2) {
            notificationEl.innerHTML += item2 + '</br>';
        });
    });

    setTimeout(function () {
        notificationEl.style.display = 'none';
        notificationEl.innerHTML = '';
    }, 3000);
}

function print(data) {
    tweetsEl.innerHTML = '';
    let originalTweetItem = document.querySelector('.tweet-item');
    data.forEach(function (item, i) {
        let tweetItem = originalTweetItem.cloneNode(true);
        tweetItem.querySelector('.tweet-content p').innerHTML = item.body;
        tweetItem.querySelector('.tweet-header .headerName').innerHTML = item.user.name;
        tweetItem.querySelector('.tweet-header .headerTime').innerHTML = item.created_at_str;
        tweetItem.querySelector('.tweetUserAvatar').src = item.user.avatar;

        tweetItem.querySelector('.tweet-header .headerUserName').innerHTML = '@' + item.user.username;
        tweetItem.classList.add('tweet-item');
        tweetItem.style.display = 'block';

        let tweetDelete = tweetItem.querySelector('.tweet-delete');

        tweetDelete.dataset.target = item.id;
        tweetDelete.addEventListener('click', function () {
            let selectedIndexDelete = this.dataset.target;
            axios.delete(apiBaseUrl + 'api/tweets/' + selectedIndexDelete + '/delete', {
                headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}
            })
                .then(function (dataDelete) {
                    if (dataDelete.data.success == true) {
                        tweetItem.remove();
                    } else {
                        notificationEl.innerHTML = dataDelete.data.message;
                        setTimeout(function () {
                            notificationEl.innerHTML = '';
                            notificationEl.style.display = 'none';

                        }, 2000)
                        notificationEl.style.display = 'block';
                    }

                });
        });

        //Jr. Front-end Developer Sema Kırdar

        let like = item.likes;
        if (like == null)
            like = 0;


        tweetItem.querySelector('.fav-icon span').innerHTML = like;
        let favIcon = tweetItem.querySelector('.favIcon');


        tweetsEl.appendChild(tweetItem);

        if (item.is_liked == true) {
            favIcon.classList.add('active');
        }

        favIcon.dataset.target = item.id;

        favIcon.addEventListener('click', function () {
            let selectedIndex = this.dataset.target;
            if (favIcon.classList.contains('active')) {

                axios.post(apiBaseUrl + 'api/tweets/' + selectedIndex + '/dislike', {}, {
                    headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}
                })
                    .then(function (dislikeData) {
                        console.log(dislikeData.data);
                        if (dislikeData.data.success == true) {

                            favIcon.classList.remove('active');
                            getTweets();
                        }
                    });

            } else {


                axios.post(apiBaseUrl + 'api/tweets/' + selectedIndex + '/like', {}, {
                    headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}
                })
                    .then(function (likeData) {
                        console.log(likeData.data);
                        if (likeData.data.success == true) {
                            favIcon.classList.add('active');
                            getTweets();

                        }
                    });
            }

        });
    });
}

function getTweets() {
    axios.get(apiBaseUrl + 'api/tweets', {
        headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}
    })
        .then(function (tweetData) {
            console.log(tweetData.data.data);
            print(tweetData.data.data);
        })
}

function updateUserCard() {
    let user = JSON.parse(localStorage.getItem('user'));

    document.getElementById('followingCount').innerHTML = user.following_count;
    document.getElementById('followersCount').innerHTML = user.followers_count;
    document.getElementById('name').innerHTML = user.name;
    document.getElementById('username').innerHTML = '@' + user.username;
    document.getElementById('userAvatar').src = user.avatar;
    document.getElementById('bio').innerHTML = user.bio;
}

function printPeoples() {
    loader.style.display = 'flex';
    axios.get(apiBaseUrl + 'api/peoples', {
        headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}
    })
        .then(function (newPeopleData) {
            peoplesEl.innerHTML = '';
            loader.style.display = 'none';
            let originalPeopleItem = document.querySelector('.people-item');
            newPeopleData.data.data.forEach(function (item, i) {
                let peopleItem = originalPeopleItem.cloneNode(true);
                peopleItem.querySelector('.peopleAvatar').src = item.avatar;
                peopleItem.querySelector('.peopleName').innerHTML = item.name;
                peopleItem.querySelector('.peopleUsername').innerHTML = '@' + item.username;

                peopleItem.querySelector('.btn-follow').dataset.target = item.id;

                peopleItem.querySelector('.btn-follow').addEventListener('click', function () {
                    let id = this.dataset.target;
                    let button = this;

                    axios.post(apiBaseUrl + 'api/peoples/' + id + '/follow', {}, {
                        headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}
                    })
                        .then(function (response) {
                            console.log(response);
                            if (response.data.success) {
                                document.getElementById('followingCount').innerHTML = response.data.data.following_count;
                                document.getElementById('followersCount').innerHTML = response.data.data.followers_count;

                                button.style.display = 'none';

                            }
                        });
                });

                peopleItem.style.display = 'flex';
                peoplesEl.appendChild(peopleItem);

            });
        });
}

checkLogin();

function checkLogin() {
    let token = localStorage.getItem('token');
    if (token != null) {
        loginPage.style.display = 'none';
        registerPage.style.display = 'none';
        homePage.style.display = 'block';

        getData();
    }
}

function getData() {
    parseInt();
    getTweets();
    updateUserCard();
    printPeoples();
}

logout.addEventListener('click', function () {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    homePage.style.display = 'none';
    loginPage.style.display = 'flex';
    registerPage.style.display = 'none';
});

userUpdate.addEventListener('click', function () {
    userModal.style.display = 'block';


});


profilUpdate.addEventListener('submit', function (e) {
    e.preventDefault(); //sayfayı yenilememesi için
    let formData = new FormData(this);
    let user = JSON.parse(localStorage.getItem('user'));

    axios.post(apiBaseUrl + 'api/profile/' + user.id + '/update', formData, {
        headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}
    })
        .then(function (dataUpdate) {
            console.log(dataUpdate);

            if (dataUpdate.data.success == true) {
                userModal.style.display = 'none';
                localStorage.setItem('user', JSON.stringify(dataUpdate.data.user));
                updateUserCard();
                getTweets();
            } else {

            }
        })
        .catch(function (error) {
            if (error.response.status == 422) {
                //validation hataları

                printValidationError(error.response.data.errors);
            }
        });


});