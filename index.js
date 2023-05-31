// import { tweetsData } from './data.js'
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

let tweetsData = getTweetsData();

function saveTweetsData() {
    localStorage.setItem('tweetsData', JSON.stringify(tweetsData));
}

function getTweetsData() {
    const data = localStorage.getItem('tweetsData');
    return data ? JSON.parse(data) : [];
}


document.addEventListener('click', function (e) {
    if (e.target.dataset.like) {
        handleLikeClick(e.target.dataset.like, e);
    } else if (e.target.dataset.retweet) {
        handleRetweetClick(e.target.dataset.retweet);
    } else if (e.target.dataset.reply) {
        handleReplyClick(e.target.dataset.reply);
    } else if (e.target.id === 'tweet-btn') {
        handleTweetBtnClick();
    } else if (e.target.classList.contains('fa-paper-plane')) {
        const tweetId = e.target.parentNode.parentNode.querySelector('textarea').getAttribute('data-input-reply-id');
        handleTweetReplyBtnClick(tweetId);
    } else if (e.target.classList.contains('fa-trash')) {
        const tweetId = e.target.parentNode.parentNode.parentNode.getAttribute('data-tweet-id');
        handleDeleteClick(tweetId);
    }
});

function handleDeleteClick(tweetId) {
    const index = tweetsData.findIndex(function (tweet) {
        return tweet.uuid === tweetId;
    });

    if (index > -1) {
        tweetsData.splice(index, 1);
        render();
        saveTweetsData();
    }
}


function handleLikeClick(tweetId, e) {
    const targetTweetObj = tweetsData.filter(function (tweet) {
        return tweet.uuid === tweetId;
    })[0];
    if (targetTweetObj.isLiked) {
        targetTweetObj.likes--;
    } else {
        targetTweetObj.likes++;
        e.target.classList.remove('liked');
    }
    targetTweetObj.isLiked = !targetTweetObj.isLiked;
    render();
    saveTweetsData();
}

function handleRetweetClick(tweetId) {
    const targetTweetObj = tweetsData.filter(function (tweet) {
        return tweet.uuid === tweetId;
    })[0];
    if (targetTweetObj.isRetweeted) {
        targetTweetObj.retweets--;
    } else {
        targetTweetObj.retweets++;
    }
    targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted;
    render();
    saveTweetsData();
}

function handleReplyClick(tweetId) {
    document.getElementById('replies-' + tweetId).classList.toggle('hidden');
}

function handleTweetBtnClick() {
    const tweetInput = document.getElementById('tweet-input')
    if (tweetInput.value) {
        tweetsData.unshift(
            {
                handle: `@Kevin_Do 💎`,
                profilePic: `images/scrimbalogo.png`,
                likes: 0,
                retweets: 0,
                tweetText: tweetInput.value,
                replies: [],
                isLiked: false,
                isRetweeted: false,
                uuid: uuidv4(),
            }
        )
        tweetInput.value = ''
        render();
    }
}

function handleTweetReplyBtnClick(tweetId) {
    const tweetReplyInput = document.getElementById(`tweet-reply-input-${tweetId}`);
    if (tweetReplyInput.value) {
        const replyText = tweetReplyInput.value;
        const replyObj = {
            handle: '@Kevin_Do 💎',
            profilePic: 'images/scrimbalogo.png',
            tweetText: replyText,
        };

        const targetTweetObj = tweetsData.find(function (tweet) {
            return tweet.uuid === tweetId;
        });

        targetTweetObj.replies.unshift(replyObj);
        document.getElementById('replies-' + tweetId).classList.remove('hidden');
    }

    tweetReplyInput.value = '';
    renderReplies(tweetId);
    updateTweetDetails(tweetId);
    saveTweetsData();

}

function getFeedHtml() {
    let feedHtml = ``;

    tweetsData.forEach(function (tweet) {
        let heartClass = '';
        let retweetClass = '';
        if (tweet.isLiked) {
            heartClass = 'liked';
        }

        if (tweet.isRetweeted) {
            retweetClass = 'retweeted';
        }

        let repliesHtml = ``;

        repliesHtml += `
            <div class="tweet-reply">
                <div class="tweet-inner">
                    <img src="images/scrimbalogo.png" class="profile-pic">
                    <div class="father-reply">
                        <p class="handle">@Kevin_Do 💎</p>
                        <textarea placeholder="Tweet your reply!" id="tweet-reply-input-${tweet.uuid}" data-input-reply-id='${tweet.uuid}'></textarea>
                        <i class="fa fa-paper-plane" id="reply-input-btn"></i>
                    </div>
                </div>
            </div>
        `

        if (tweet.replies.length > 0) {
            repliesHtml += renderReplies(tweet.uuid); 
        }

        feedHtml += `
            <div class="tweet" data-tweet-id="${tweet.uuid}">
                <div class="tweet-inner">
                    <img src="${tweet.profilePic}" class="profile-pic">
                    <div>
                        <p class="handle">${tweet.handle}</p>
                        <i class="fa fa-trash trashCan"></i>
                        <p class="tweet-text">${tweet.tweetText}</p>
                        <div class="tweet-details">
                            <span class="tweet-detail">
                                <i class="fa-regular fa-comment-dots" data-reply='${tweet.uuid}'></i>
                                ${tweet.replies.length}
                            </span>
                            <span class="tweet-detail">
                                <i class="fa-solid fa-heart ${heartClass}" data-like='${tweet.uuid}'></i>
                                ${tweet.likes}
                            </span>
                            <span class="tweet-detail">
                                <i class="fa-solid fa-retweet ${retweetClass}" data-retweet='${tweet.uuid}'></i>
                                ${tweet.retweets}
                            </span>
                        </div>   
                    </div>            
                </div>
            </div>

            <div class='hidden' id="replies-${tweet.uuid}">
                ${repliesHtml}
            </div>  
        `
    })
    return feedHtml
}

function renderReplies(tweetId) {
    const targetTweetObj = tweetsData.find(function (tweet) {
        return tweet.uuid === tweetId;
    });

    let repliesHtml = ``;

    if (targetTweetObj.replies.length > 0) {
        targetTweetObj.replies.forEach(function (reply) {
            repliesHtml += `
                <div class="tweet-reply">
                    <div class="tweet-inner">
                        <img src="${reply.profilePic}" class="profile-pic">
                        <div>
                            <p class="handle">${reply.handle}</p>
                            <p class="tweet-text">${reply.tweetText}</p>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    const repliesContainer = document.getElementById(`replies-${tweetId}`);
    if (repliesContainer) {
        repliesContainer.innerHTML = `
        <div class="tweet-reply">
        <div class="tweet-inner">
            <img src="images/scrimbalogo.png" class="profile-pic">
            <div class="father-reply">
                <p class="handle">@Kevin_Do 💎</p>
                <textarea placeholder="Tweet your reply!" id="tweet-reply-input-${tweetId}" data-input-reply-id='${tweetId}'></textarea>
                <i class="fa fa-paper-plane" id="reply-input-btn"></i>
            </div>
        </div>
    </div>
        ${repliesHtml} 
        `
    }

    return repliesHtml;
}

function updateTweetDetails(tweetId) {
    const targetTweetObj = tweetsData.find(function (tweet) {
        return tweet.uuid === tweetId;
    });

    const repliesCountElement = document.querySelector(`[data-reply='${tweetId}']`);
    if (repliesCountElement) {
        repliesCountElement.parentElement.innerHTML = `
            <i class="fa-regular fa-comment-dots" data-reply='${tweetId}'></i>
            ${targetTweetObj.replies.length}
        `;
    }
}

function render() {
    document.getElementById('feed').innerHTML = getFeedHtml();
}

render();