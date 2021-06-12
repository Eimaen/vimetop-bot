const request = require('request');
const { username, hash, userAgent, profileAutoDiscover, statusLiked } = require('./config.json');

const apiBase = 'https://vimetop.ru/ajax/';

const cj = request.jar();
cj.setCookie(`auth_hash=${hash}`, 'https://vimetop.ru');
cj.setCookie(`nickname=${username}`, 'https://vimetop.ru');

var setStatus = (status) => {
    request.post({ url: apiBase + 'player/statusChange.php', headers: { 'User-Agent': userAgent, 'X-Requested-With': 'XMLHttpRequest' }, jar: cj, formData: { text: status } });
};

var like = (username) => {
    request.post({ url: apiBase + 'player/likeProfile.php', headers: { 'User-Agent': userAgent, 'X-Requested-With': 'XMLHttpRequest' }, jar: cj, formData: { page: username, action: 'like' } });
};

var view = (username) => {
    request.get({ url: `https://vimetop.ru/player/${username}`, headers: { 'User-Agent': userAgent, 'X-Requested-With': 'XMLHttpRequest' }, jar: cj });
    // request.post({ url: apiBase + `player/likeProfile.php?_=${username}_views`, headers: { 'User-Agent': userAgent, 'X-Requested-With': 'XMLHttpRequest' }, jar: cj, formData: { page: username, action: 'views' } }, (err, res, body) => console.log(body));
    // request.post({ url: apiBase + `/load.page.php`, headers: { 'User-Agent': userAgent, 'X-Requested-With': 'XMLHttpRequest' }, jar: cj, formData: { username: username, page: 'player' }, json: true }, (err, res, body) => console.log(body));
};

if (profileAutoDiscover) {
    var taskList = [];

    setInterval(() => {
        request.post({ url: apiBase + 'main/statusUpdate.php', headers: { 'User-Agent': userAgent, 'X-Requested-With': 'XMLHttpRequest' }, jar: cj, formData: { ts: '-1' }, json: true }, (err, res, body) => {
            body.response.forEach(user => {
                taskList.push(user.nickname);
            });
        });
    }, 30000);

    setInterval(() => {
        if (taskList.length == 0)
            return;
        var username = taskList.pop();
        view(username);
        console.log(`Looking at ${username} profile`);
    }, 1000);
}

if (statusLiked)
    setInterval(() => {
        request.post({ url: apiBase + 'player/likeList.php', headers: { 'User-Agent': userAgent, 'X-Requested-With': 'XMLHttpRequest' }, jar: cj, formData: { username: username }, json: true }, (err, res, body) => {
            var liker = body.likes.list[0].liker.username;
            setTimeout(() => {
                setStatus(`Спасибо за лайк, @${liker}!`);
                console.log(`Status updated, now mentioning ${liker}`);
            }, 1000);
        });
    }, 5000);
