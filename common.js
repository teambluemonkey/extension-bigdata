var POSITIVE_THRESHOLD = 0.4;
var NEGATIVE_THRESHOLD = 0.0;

var LOADING_IMAGE_URL = chrome.extension.getURL('loading.gif');

var MODULE_HTML = '                                                 \
    <div id="tj-module">                                            \
        <div id="tj-header">                                        \
            Blue Monkey                                             \
        </div>                                                      \                                                \
        <div id="tj-body">                                          \
            <div id="loading">                                      \
                <img id="loading-image" src="$LOADING_IMAGE_URL">   \
            </div>                                                  \
        </div>                                                      \
    </div>';

var ITEM_HTML = '                             \
    <div class="tj-item">                     \
       <div class="tj-name">                  \
           $CATEGORY_NAME                     \
       </div>                                 \
       <div class="tj-rating $RATING_CLASS">  \
           $RATING                            \
       </div>                                 \
   </div>';

var TAG_HTML = '                              \
       <div class="tj-tag">                   \
              <a href="$SEARCH_LINK">$TAG_NAME</a>                       \
       </div>';
         
var UNDEFINED_ITEM_HTML = '                   \
   <div class="tj-item">                      \
      <div class="tj-name tj-undefined">      \
           No categories detected :(          \
      </div>                                  \
   </div>';
      
var GUARDIAN_BASE = "http://www.guardian.co.uk";
var SAMEER_URL_BASE = 'http://192.168.43.118:3000/guardian/';
var ERNEST_URL_BASE = 'http://192.168.43.228:3000/guardian/';
var AMAZON_URL_BASE = 'http://ec2-184-73-119-74.compute-1.amazonaws.com/guardian/';
var SERVER_URL_BASE = AMAZON_URL_BASE;

function addTag(name) {
    var module_content = $('#tag-cloud');
    
    link = 'http://www.guardian.co.uk/search?q=' + name + '&target=guardian';
        
    html = TAG_HTML.replace('$TAG_NAME', name)
                   .replace('$SEARCH_LINK', link);
    module_content.append(html);
};

function addCategory(name, rating) {
    var module_content = $('#tj-body');
    
    if(rating >= POSITIVE_THRESHOLD)
        value_class = 'positive-rating';
    else if(rating >= NEGATIVE_THRESHOLD)
        value_class = 'neutral-rating';
    else 
        value_class = 'negative-rating';
    
    html = ITEM_HTML.replace('$RATING_CLASS', value_class)
                    .replace('$CATEGORY_NAME', name)
                    .replace('$RATING', rating);
    module_content.append(html);
};

function getRequestUrl() {
    var path_name = window.location.pathname;

    var comments_url = null; 
    var comments_iframe = $("[name='d2-iframe']");
    if (typeof(comments_iframe) !== undefined && comments_iframe[0] !== undefined) {
        comments_url = comments_iframe[0].src;
    }

    var query_url = "";
    if(comments_url != null)
        query_url = SERVER_URL_BASE + encodeURIComponent(path_name) + "?comment_url=" + encodeURIComponent(comments_url);
    else
        query_url = SERVER_URL_BASE + encodeURIComponent(path_name);
        
    return query_url;
};

if($('#article-header').length == 0) {
    // not an article page
}
else {
    // add module to page
    var body = $("body");
    var module_html = MODULE_HTML.replace('$LOADING_IMAGE_URL', LOADING_IMAGE_URL);
    body.prepend(module_html);

    //send request
    var query_url = getRequestUrl();
    console.log(query_url);
    
    $.get(query_url, function(data) {
        console.log('got request');
        $('#loading').remove();
    
        if(!data.semantria_data || !data.semantria_data[0] || !data.semantria_data[0].topics) {
            var module_content = $('#tj-body');
            module_content.append(UNDEFINED_ITEM_HTML);
        }
        else
        {
            var topics = data.semantria_data[0].topics;
            for (var i = 0; i < topics.length; i++) {
                topic = topics[i];
                addCategory(topic.title, topic.strength_score.toFixed(2));
            }
            
            $('#tj-body').append('<br/><br/><div id="tag-cloud"></div>');
            var article_data = data.article_data;
            var response = article_data.response;
            var content = response.content;
            var tags = content.tags;
            for (var j = 0; j < tags.length; j++) {
                tag = tags[j];
                addTag(tag.webTitle);
            }
        }
    });
}