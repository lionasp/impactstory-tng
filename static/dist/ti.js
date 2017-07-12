angular.module('aboutPages', [])



    .config(function($routeProvider) {
        $routeProvider.when('/about/data', {
            templateUrl: 'about-pages/about-data.tpl.html',
            controller: 'aboutPageCtrl'
        })
    })

    .config(function($routeProvider) {
        $routeProvider.when('/about/orcid', {
            templateUrl: 'about-pages/about-orcid.tpl.html',
            controller: 'aboutPageCtrl'
        })
    })

    .config(function($routeProvider) {
        $routeProvider.when('/about/legal', {
            templateUrl: 'about-pages/about-legal.tpl.html',
            controller: 'aboutPageCtrl'
        })
    })

    .config(function($routeProvider) {
        $routeProvider.when('/about', {
            templateUrl: 'about-pages/about.tpl.html',
            controller: 'aboutPageCtrl'
        })
    })

    .config(function($routeProvider) {
        $routeProvider.when('/search', {
            templateUrl: 'about-pages/search.tpl.html',
            controller: 'searchPageCtrl'
        })
    })

    .config(function($routeProvider) {
        $routeProvider.when('/sample', {
            templateUrl: 'about-pages/sample.tpl.html',
            controller: 'samplePageCtrl'
        })
    })

    .config(function($routeProvider) {
        $routeProvider.when('/about/achievements', {
            templateUrl: 'about-pages/about-badges.tpl.html',
            controller: 'aboutPageCtrl',
            resolve: {
                badgesResp: function($http, $route, BadgeDefs){
                    console.log("loaded the badge defs in the route def")
                    return BadgeDefs.load()
                }
            }
        })
    })

    .controller("searchPageCtrl", function($scope, $http, $location){
        $scope.ctrl = {}

        $scope.onSearchSelect = function(selection){
            console.log("selection!", selection)
            $scope.loading = true
            $location.url("u/" + selection.orcid_id)

        }

        $scope.search = function(searchName) {
            return $http.get("api/search/" + searchName)
                .then(function(resp){
                    console.log("got search results back", resp)
                    return resp.data.list
                })
        }
        $http.get("/api/people")
            .success(function(resp){
                $scope.numProfiles = resp.count
            })
    })

    .controller("samplePageCtrl", function($scope, $http){
        console.log("sample page ctrl!")
        $http.get("/api/products").success(
            function(resp){
                console.log("got /api/product resp back", resp)
                $scope.products = resp.list
            }
        )

    })


    // used for about/achievements
    // used for about/data
    // used for about
    .controller("aboutPageCtrl", function($scope,
                                          $timeout,
                                           $routeParams,
                                           $anchorScroll,
                                           BadgeDefs){
        $scope.badgeDefs = BadgeDefs

        $timeout(function(){
            $anchorScroll();
        }, 500)
        
        // copied from person page
        var subscoreSortOrder = {
            buzz: 1,
            engagement: 2,
            openness: 3,
            fun: 4
        }

        // convert to a list in a kinda dumb way, whatevs.
        var badgesList = []
        _.each(BadgeDefs.d, function(v, k){
            var myBadge = _.extend({}, v);
            myBadge.id = k
            myBadge.description = myBadge.description.replace("{value}", "<em class='n'>n</em>")
            badgesList.push(myBadge)
        })

        console.log("badges", badgesList)




        // group the badges by Badge Group
        var badgesByGroup = _.groupBy(badgesList, "group")
        var badgeGroups = []
        _.each(badgesByGroup, function(badges, groupName){
            console.log("group name" , groupName)
            if (groupName  && groupName != "null"){ // hack
                badgeGroups.push({
                    name: groupName,
                    sortLevel: subscoreSortOrder[groupName],
                    badges: badges
                })
            }

        })

        $scope.badgeGroups = badgeGroups

        // group everything by Aggregation Level (person or product)
        //var badges = _.groupBy(badgeGroups, "aggregationLevel")
        //$scope.badges = badges





        //if ($auth.isAuthenticated()){
        //    var myOrcidId = $auth.getPayload()["sub"]
        //    Person.load(myOrcidId).success(function(resp){
        //        console.log("loaded the person", Person.d)
        //        $scope.iHaveThisBadge = function(badgeId){
        //            return _.findWhere(Person.d.badges, {name: badgeId})
        //        }
        //    })
        //}









    })




angular.module('app', [

    // external libs
    'ngRoute',
    'ngMessages',
    'ngCookies',
    'satellizer',

    'ngResource',
    'ngSanitize',
    'ngMaterial',
    'ngProgress',

    // this is how it accesses the cached templates in ti.js
    'templates.app',

    // services
    'currentUser',
    'auth',
    'badgeDefs',
    'numFormat',
    'person',

    // pages
    'staticPages',
    'productPage', // MUST be above personPage because personPage route is greedy for /p/
    'personPage',
    'settingsPage',
    'wizard',
    'aboutPages'

]);








angular.module('app').config(function ($routeProvider,
                                       $mdThemingProvider,
                                       $locationProvider) {


    $locationProvider.html5Mode(true);

    // handle 404s.
    $routeProvider.otherwise({ redirectTo: 'page-not-found' })

    $mdThemingProvider.theme('default')
        .primaryPalette('deep-orange')
        .accentPalette("blue")



});


angular.module('app').run(function($route,
                                   $rootScope,
                                   $q,
                                   $timeout,
                                   $cookies,

                                   $http,
                                   $location,
                                   CurrentUser,
                                   Person) {


    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

    ga('create', 'UA-23384030-1', 'auto');

    // if the user is logged in, get the most up-to-date token
    CurrentUser.boot()






    $rootScope.$on('$routeChangeStart', function(next, current){
    })
    $rootScope.$on('$routeChangeSuccess', function(next, current){
        window.scrollTo(0, 0)
        ga('send', 'pageview', { page: $location.url() });
        window.Intercom('update')

    })










    $rootScope.$on('$routeChangeError', function(event, current, previous, rejection){
        console.log("$routeChangeError! here's some things to look at: ", event, current, previous, rejection)

        $location.url("page-not-found")
        window.scrollTo(0, 0)
    });




});





angular.module('app').controller('AppCtrl', function(
    ngProgressFactory,
    $rootScope,
    $scope,
    $route,
    $location,
    NumFormat,
    $interval,
    $http,
    CurrentUser,
    $mdDialog,
    $auth, // todo remove
    $sce){

    var progressBarInstance = ngProgressFactory.createInstance();

    $rootScope.progressbar = progressBarInstance
    $scope.progressbar = progressBarInstance

    $scope.auth = $auth  // todo remove
    $scope.currentUser = CurrentUser
    $scope.numFormat = NumFormat
    $scope.moment = moment // this will break unless moment.js loads over network...






    $scope.global = {}



    $scope.pageTitle = function(){
        if (!$scope.global.title){
            $scope.global.title = "Discover the online impact of your research"
        }
        return "Impactstory: " + $scope.global.title
    }


    $rootScope.$on('$routeChangeSuccess', function(next, current){
        $scope.global.showBottomStuff = true
        $scope.global.hideHeader = false

        $scope.global.template = current.loadedTemplateUrl
            .replace("/", "-")
            .replace(".tpl.html", "")
        $scope.global.loggingIn = false
        $scope.global.title = null
        $scope.global.isLandingPage = false
        $scope.global.isFocusPage = false
        $location.search("source", null)
    })

    $scope.trustHtml = function(str){
        return $sce.trustAsHtml(str)
    }
    $scope.pluralize = function(noun, number){
        //pluralize.addSingularRule(/slides$/i, 'slide deck')
        return pluralize(noun, number)
    }



    // config stuff
    // badge group configs
    var badgeGroupIcons = {
        engagement: "user",
        openness: "unlock-alt",
        buzz: "bullhorn",
        fun: "smile-o"
    }
    $scope.getBadgeIcon = function(group){
        if (badgeGroupIcons[group]){
            return badgeGroupIcons[group]
        }
        else {
            return "fa-trophy"
        }
    }

    
    // genre config
    var genreIcons = {
        'article': "file-text-o",
        'blog': "comments",
        'dataset': "table",
        'figure': "bar-chart",
        'image': "picture-o",
        'poster': "map-o",
        'conference-poster': "map-o",
        'slides': "desktop",
        'software': "save",
        'twitter': "twitter",
        'video': "facetime-video",
        'webpage': "laptop",
        'online-resource': "desktop",
        'preprint': "paper-plane-o",
        'other': "ellipsis-h",
        'unknown': "file-o",
        "conference-paper": "list-alt",  // conference proceeding
        "book": "book",
        "book-chapter": "bookmark-o",  // chapter anthology
        "thesis": "graduation-cap",
        "dissertation": "graduation-cap",
        "peer-review": "comments-o"
    }
    $scope.getGenreIcon = function(genre){
        if (genreIcons[genre]){
            return genreIcons[genre]
        }
        else {
            return genreIcons.unknown
        }
    }



    var showAlert = function(msgText, titleText, okText){
        if (!okText){
            okText = "ok"
        }
          $mdDialog.show(
                  $mdDialog.alert()
                    .clickOutsideToClose(true)
                    .title(titleText)
                    .textContent(msgText)
                    .ok(okText)
            );
    }
    $rootScope.showAlert = showAlert









    /********************************************************
     *
     *  stripe stuff
     *
    ********************************************************/



    var stripeInfo = {
        email: null,
        tokenId: null,
        cents: 0,

        // optional
        fullName: null,
        orcidId: null
    }

    var stripeHandler = StripeCheckout.configure({
        key: stripePublishableKey,
        locale: 'auto',
        token: function(token) {
            stripeInfo.email = token.email
            stripeInfo.tokenId = token.id

            console.log("now we are doing things with the user's info", stripeInfo)
            $http.post("/api/donation", stripeInfo)
                .success(function(resp){
                    console.log("the credit card charge worked!", resp)
                    showAlert(
                        "We appreciate your donation, and we've emailed you a receipt.",
                        "Thanks so much!"
                    )
                })
                .error(function(resp){
                    console.log("error!", resp.message)
                    if (resp.message){
                        var reason = resp.message
                    }
                    else {
                        var reason = "Sorry, we had a server error! Drop us a line at team@impactstory.org and we'll fix it."
                    }
                    showAlert(reason, "Credit card error")
                })
        }
      });
    $scope.donate = function(cents){
        console.log("donate", cents)
        stripeInfo.cents = cents
        if (CurrentUser.isLoggedIn()){
            stripeInfo.fullName = CurrentUser.d.given_names + " " + CurrentUser.d.family_name
            stripeInfo.orcidId = CurrentUser.d.orcid_id
        }

        stripeHandler.open({
          name: 'Impactstory donation',
          description: "We're a US 501(c)3",
          amount: cents
        });
    }


})



.controller('badgeItemCtrl', function($scope){
    $scope.showMaxItems = 3
    $scope.getIconUrl = function(name){
    }
})

.controller('tweetRollupCtrl', function($scope){
    $scope.showTweets = false
})

.controller('mendeleyRollupCtrl', function($scope){
    $scope.showMendeley = false
})
    
.directive('subscorehelp', function(){
        return {
            restrict: "E",
            templateUrl: 'helps.tpl.html',
            scope:{
                subscoreName: "=name"
            },
            link: function(scope, elem, attrs){
            }
        }
    })

.directive('short', function(){
        return {
            restrict: "E",
            template: '{{shortText}}<span ng-show="shortened">&hellip;</span>',
            scope:{
                text: "=text",
                len: "=len"
            },
            link: function(scope, elem, attrs){

                var newLen
                if (scope.len) {
                    newLen = scope.len
                }
                else {
                    newLen = 40
                }
                if (scope.text.length > newLen){
                    var short = scope.text.substring(0, newLen)
                    short = short.split(" ").slice(0, -1).join(" ")
                    scope.shortText = short
                    scope.shortened = true
                }
                else {
                    scope.shortText = scope.text
                }

            }
        }
    })















console.log("loading")
angular.module('auth', [
    'ngRoute',
    'satellizer',
    'ngMessages'
])

    .config(function ($routeProvider) {
        $routeProvider.when('/oauth/:intent/:identityProvider', {
            templateUrl: "auth/oauth.tpl.html",
            controller: "OauthCtrl"
        })
    })


    .config(function ($routeProvider) {
        $routeProvider.when('/login', {
            templateUrl: "auth/login.tpl.html",
            controller: "LoginCtrl"
        })
    })


    .controller("LoginCtrl", function($scope, CurrentUser, $location, $http){
        console.log("LoginCtrl is running!")
        $scope.currentUser = CurrentUser
        $scope.global.showBottomStuff = false
        $scope.global.hideHeader = true
        $scope.global.isFocusPage = true






    })

    .controller("OauthCtrl", function($scope, $cookies, $routeParams, $location, $http, $mdToast, CurrentUser){
        $scope.global.showBottomStuff = false
        $scope.global.hideHeader = true
        $scope.global.isFocusPage = true


        var requestObj = $location.search()
        if (_.isEmpty(requestObj)){
            console.log("we didn't get any codes or verifiers in the URL. aborting.")
            $location.url("/")
            return false
        }

        // set scope vars
        $scope.identityProvider = $routeParams.identityProvider
        $scope.intent = $routeParams.intent
        $scope.global.showBottomStuff = false



        var absUrl = $location.absUrl()
        requestObj.redirectUri = absUrl.split("?")[0] // remove the search part of URL
        console.log("using this redirectUri", requestObj.redirectUri)

        // track signups that started at the opencon landing page
        // this is ignored by server unless we are hitting /me/twitter/register
        var landingPage = $cookies.get("customLandingPage")
        if (!landingPage){
            landingPage = "default"
        }
        requestObj.customLandingPage = landingPage

        var urlBase = "api/me/"
        var url = urlBase + $routeParams.identityProvider + "/" + $routeParams.intent


        // temp hack
        if ($routeParams.identityProvider == "twitter" && $routeParams.intent == "connect"){
            var msg = "Your Twitter account is connected!"
        }





        console.log("sending this up to the server", requestObj)
        $http.post(url, requestObj)
            .success(function(resp){
                console.log("we successfully called am api/me endpoint. got this back:", resp)
                CurrentUser.setFromToken(resp.token)
                CurrentUser.sendHome()
                if (msg){
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent(msg)
                            .position("top")
                    )
                }

            })
            .error(function(error, status){
                console.log("the server returned an error", status, error)
                if (status == 404) {
                    $scope.error = "not-found"
                    $scope.identityProviderId = error.identity_provider_id
                }

                // handle users who are loading this page with
                // invalid or expired tokens. this is generally because they
                // are refreshing the page. since the token they came in with
                // only works once, this does not work.
                if (status == 401){
                    CurrentUser.logout()
                    $location.url("/")
                }

            })

    })











angular.module("filterService", [])

.factory("FilterService", function($location){

    var filters = {
      only_academic: "true",
      language: "python",
      tag: null,
      type: "pacakges"
    }

    var setFromUrl = function(){
      filters.only_academic = $location.search().only_academic
      filters.tag = $location.search().tag
      filters.language = $location.search().language
      filters.type = $location.search().type
      if (!filters.language){
        set("language", "python")
      }
      if (!filters.type){
        set("type", "people")
      }
      console.log("set filters from url", filters)
    }

    var set = function(k, v){
      filters[k] = v
      $location.search(k, v)
    }
    var toggle = function(k){
      // for booleans
      if (filters[k]) {
        filters[k] = null
      }
      else {
        filters[k] = "true"  // must be string or won't show up in url
      }
      $location.search(k, filters[k])
    }

    var unset = function(k){
      filters[k] = null
    }
    var unsetAll = function(){
        console.log("unset all!")
        _.each(filters, function(v, k){
            filters[k] = null
            $location.search(k, null)
        })
    }

    var asQueryStr = function(){
      var ret = []
      _.each(filters, function(v, k){
        if (v){
          ret.push(k + "=" + v)
        }
      })
      return ret.join("&")
    }


  return {
    d: filters,
    set: set,
    toggle: toggle,
    unset: unset,
    setFromUrl: setFromUrl,
    asQueryStr: asQueryStr,
    unsetAll: unsetAll
  }
});
angular.module('footer', [
])



    .controller("footerCtrl", function($scope,
                                       $location,
                                       $rootScope,
                                       FormatterService,
                                       FilterService,
                                       $http){


        //$scope.hideEmailSignup = !!$.cookie("hideEmailSignup")
        //
        //
        //$scope.dismissEmailSignup = function(){
        //    console.log("dismiss the signup")
        //    $scope.hideEmailSignup = true
        //    !$.cookie("hideEmailSignup", true)
        //}



    })







angular.module('personPage', [
    'ngRoute',
    'person'
])



    .config(function($routeProvider) {
        $routeProvider.when('/u/:orcid/:tab?/:filter?', {
            templateUrl: 'person-page/person-page.tpl.html',
            controller: 'personPageCtrl',
            reloadOnSearch: false,
            resolve: {
                personResp: function($q, $http, $rootScope, $route, $location, Person, CurrentUser){
                    console.log("person is loading!", $rootScope)
                    var urlId = $route.current.params.orcid

                    if (urlId.indexOf("0000-") === 0){ // got an ORCID

                        // if this is my profile
                        if (urlId == CurrentUser.d.orcid_id) {
                            var redirecting = CurrentUser.sendHome()
                            if (redirecting){
                                var deferred = $q.defer()
                                return deferred.promise
                            }
                        }

                        return Person.load(urlId)
                    }
                    else { // got a twitter name
                        console.log("got something other than an orcid in the slug. trying as twitter ID")
                        var deferred = $q.defer()

                        $http.get("/api/person/twitter_screen_name/" + urlId)
                            .success(function(resp){
                                console.log("this twitter name has an ORCID. redirecting there: ", resp.id)
                                // we don't reject of resolve the promise. that's
                                // to keep this route from resolving and showing garbage while
                                // the redirect is loading.
                                $location.url("/u/" + resp.id)
                            })
                            .error(function(resp){
                                console.log("got 404 resp back about the twitter name")
                                deferred.reject()
                            })
                        return deferred.promise
                    }
                }
            }
        })
    })



    .controller("personPageCtrl", function($scope,
                                           $routeParams,
                                           $rootScope,
                                           $route,
                                           $http,
                                           $auth,
                                           $mdDialog,
                                           $location,
                                           $timeout,
                                           $sce,
                                           Person,
                                           NumFormat,
                                           personResp){





        $scope.global.title = Person.d.given_names + " " + Person.d.family_name
        $scope.person = Person
        $scope.products = Person.d.products
        $scope.sources = Person.d.sources
        $scope.badges = Person.badgesToShow()
        $scope.d = {}



        var badgeUrlName = function(badge){
           return badge.display_name.toLowerCase().replace(/\s/g, "-")
        }
        $scope.badgeUrlName = badgeUrlName

        console.log("retrieved the person", $scope.person)

        $scope.profileStatus = "all_good"

        // redirect the legacy "activity" tab to "timeline" (new name)
        if ($routeParams.tab == "activity"){
            console.log("activity tab")
            $location.url("u/" + Person.d.orcid_id + "/timeline")
        }


        // overview tab
        $scope.tab =  $routeParams.tab || "overview"
        if (!$routeParams.tab){
            $scope.tab = "overview"
        }



        // someone is linking to a specific badge. show overview page behind a popup
        else if ($routeParams.tab == "a") {
            $scope.tab = "achievements"
            var badgeName = $routeParams.filter
            console.log("show the badges modal, for this badge", badgeName)


            var badgeToShow = _.find(Person.d.badges, function(myBadge){
                return badgeName == badgeUrlName(myBadge)
            })
            var badgeDialogCtrl = function($scope){
                $scope.badge = badgeToShow
                $scope.badgeUrl = "/u/" + Person.d.orcid_id + "/a/" + badgeUrlName(badgeToShow)

                // this dialog has isolate scope so doesn't inherit this function
                // from the application scope.
                $scope.trustHtml = function(str){
                    return $sce.trustAsHtml(str)
                }
                $scope.cancel = function() {
                    $mdDialog.cancel();
                };
                $scope.firstName = Person.d.first_name
            }

            var dialogOptions = {
                clickOutsideToClose: true,
                templateUrl: 'badgeDialog.tpl.html',
                controller: badgeDialogCtrl
            }


            var showDialog = function(){
                $mdDialog.show(dialogOptions).then(function(result) {
                    console.log("ok'd the setFulltextUrl dialog")

                }, function() {
                    console.log("cancelled the setFulltextUrl dialog")
                    $location.url("u/" + Person.d.orcid_id + "/achievements")
                });
            }

            $timeout(showDialog, 0)


        }

        // the other tabs
        else {
            $scope.tab = $routeParams.tab
        }

        $scope.userForm = {}

        console.log("routeparamas", $routeParams)


        // this is used when you want to tweet your profile
        $scope.profileLinkToTweet = "https://impactstory.org/u/"
        if (Person.d.twitter){
            $scope.profileLinkToTweet += Person.d.twitter
        }
        else {
            $scope.profileLinkToTweet += Person.d.orcid_id
        }



        $scope.refreshFromSecretButton = function(){
            console.log("ah, refreshing!")

            // for testing
            //var url = "https://impactstory.org/api/person/" + Person.d.orcid_id

            // the real one
            var url = "/api/person/" + Person.d.orcid_id + "/refresh"

            $http.post(url)
                .success(function(resp){

                    // force the Person to reload. without this
                    // the newly-synced data never gets displayed.
                    console.log("reloading the Person")
                    Person.reload().then(
                        function(resp){
                            $scope.profileStatus = "all_good"
                            console.log("success, reloading page", resp)
                            $route.reload()
                        }
                    )
                })
        }


        $scope.shareProfile = function(){
            var myOrcid = $auth.getPayload().sub // orcid ID

            console.log("sharing means caring")
            var aDayAgo = moment().subtract(24, 'hours')
            var claimedAt = moment(Person.d.claimed_at)

            // which came first: a day ago, or when this was claimed?
            if (moment.min(aDayAgo, claimedAt) == aDayAgo){
                console.log("this profile is brand spankin' new! logging it.")

                $http.post("api/person/" + myOrcid + "/tweeted-quickly", {})
                    .success(function(resp){
                        console.log("logged the tweet with our DB", resp)
                    })

                window.Intercom("update", {
                    user_id: myOrcid,
                    tweeted_quickly: true
                })
            }

        }

        $scope.shareBadge = function(badgeName){
            window.Intercom('trackEvent', 'tweeted-badge', {
                name: badgeName
            });
            var myOrcid = $auth.getPayload().sub // orcid ID
            window.Intercom("update", {
                user_id: myOrcid,
                latest_tweeted_badge: badgeName
            })
        }

        $scope.showBadge = function(badge){
            $location.url("u/" + Person.d.orcid_id + "/a/" + badgeUrlName(badge))

        }






        // top of profile

        $scope.showAboutOaDialog = function(ev){

            $mdDialog.show({
                clickOutsideToClose: true,
                targetEvent: ev,
                templateUrl: 'aboutOaDialog.tpl.html',
                controller: function($scope){
                    console.log("running the showAboutOaDialog ctrl")
                    $scope.person = Person
                    $scope.numFormat = NumFormat
                    $scope.cancel = function() {
                        $mdDialog.cancel();
                    };
                }
            })
        }











        // posts and timeline stuff
        var posts = []
        _.each(Person.d.products, function(product){
            var myDoi = product.doi
            var myPublicationId = product.id
            var myTitle = product.title
            _.each(product.posts, function(myPost){
                myPost.citesDoi = myDoi
                myPost.citesPublication = myPublicationId
                myPost.citesTitle = myTitle
                posts.push(myPost)
            })
        })

        function makePostsWithRollups(posts){
            var sortedPosts = _.sortBy(posts, "posted_on")
            var postsWithRollups = []
            function makeRollupPost(){
                return {
                    source: 'tweetRollup',
                    posted_on: '',
                    count: 0,
                    tweets: []
                }
            }
            var currentRollup = makeRollupPost()
            _.each(sortedPosts, function(post){
                if (post.source == 'twitter'){ // this post is a tween

                    // we keep tweets as regular posts too
                    postsWithRollups.push(post)

                    // put the tweet in the rollup
                    currentRollup.tweets.push(post)

                    // rollup posted_on date will be date of *first* tweet in group
                    currentRollup.posted_on = post.posted_on
                }
                else {
                    postsWithRollups.push(post)

                    // save the current rollup
                    if (currentRollup.tweets.length){
                        postsWithRollups.push(currentRollup)
                    }

                    // clear the current rollup
                    currentRollup = makeRollupPost()
                }
            })

            // there may be rollup still sitting around because no regular post at end
            if (currentRollup.tweets.length){
                postsWithRollups.push(currentRollup)
            }
            return postsWithRollups
        }

        $scope.posts = makePostsWithRollups(posts)


        // mendeley stuff.
        // currently not using this.

        //$scope.mendeleySource = _.findWhere(Person.d.sources, {source_name: "mendeley"})
        //$scope.mendeleyCountries = _.map(_.pairs(Person.d.mendeley.country_percent), function(countryPair){
        //    return {
        //        name: countryPair[0],
        //        percent: countryPair[1]
        //    }
        //})
        //
        //$scope.mendeleyDisciplines = _.map(_.pairs(Person.d.mendeley.subdiscipline_percent), function(pair){
        //    return {
        //        name: pair[0],
        //        percent: pair[1]
        //    }
        //})



        $scope.postsFilter = function(post){
            if ($scope.selectedChannel) {
                return post.source == $scope.selectedChannel.source_name
            }
            else { // we are trying to show unfiltered view

                // but even in unfiltered view we want to hide tweets.
                return post.source != 'twitter'

            }
        }

        $scope.postsSum = 0
        _.each(Person.d.sources, function(v){
            $scope.postsSum += v.posts_count
        })

        $scope.d.viewItemsLimit = 20
        $scope.selectedChannel = _.findWhere(Person.d.sources, {source_name: $routeParams.filter})

        $scope.toggleSelectedChannel = function(channel){
            console.log("toggling selected channel", channel)
            if (channel.source_name == $routeParams.filter){
                $location.url("u/" + Person.d.orcid_id + "/timeline")
            }
            else {
                $location.url("u/" + Person.d.orcid_id + "/timeline/" + channel.source_name)
            }
        }










        // genre stuff
        var genreGroups = _.groupBy(Person.d.products, "genre")
        var genres = []
        _.each(genreGroups, function(v, k){
            genres.push({
                name: k,
                display_name: k.split("-").join(" "),
                count: v.length
            })
        })

        $scope.genres = genres
        $scope.selectedGenre = _.findWhere(genres, {name: $routeParams.filter})
        $scope.toggleSeletedGenre = function(genre){
            if (genre.name == $routeParams.filter){
                $location.url("u/" + Person.d.orcid_id + "/publications")
            }
            else {
                $location.url("u/" + Person.d.orcid_id + "/publications/" + genre.name)
            }
        }











        // achievements stuff
        var subscoreSortOrder = {
            buzz: 1,
            engagement: 2,
            openness: 3,
            fun: 4
        }
        
        // put the badge counts in each subscore
        var subscores = _.map(Person.d.subscores, function(subscore){
            var matchingBadges = _.filter(Person.badgesToShow(), function(badge){
                return badge.group == subscore.name
            })
            subscore.badgesCount = matchingBadges.length
            subscore.sortOrder = subscoreSortOrder[subscore.name]
            return subscore
        })
        $scope.subscores = subscores
        $scope.selectedSubscore = _.findWhere(subscores, {name: $routeParams.filter})

        $scope.toggleSeletedSubscore = function(subscore){
            console.log("toggle subscore", subscore)
            if (subscore.name == $routeParams.filter){
                $location.url("u/" + Person.d.orcid_id + "/achievements")
            }
            else {
                $location.url("u/" + Person.d.orcid_id + "/achievements/" + subscore.name)
            }
        }











    })




angular.module('productPage', [
    'ngRoute',
    'person'
])



    .config(function($routeProvider) {
        $routeProvider.when('/u/:orcid/doi/:id*/:filter?', {
            templateUrl: 'product-page/product-page.tpl.html',
            controller: 'productPageCtrl'
            ,
            resolve: {
                personResp: function($http, $route, Person){
                    console.log("loaded the person response in the route def")
                    return Person.load($route.current.params.orcid)
                }
            }
        })
    })

    .config(function($routeProvider) {
        $routeProvider.when('/u/:orcid/p/:id/:filter?', {
            templateUrl: 'product-page/product-page.tpl.html',
            controller: 'productPageCtrl'
            ,
            resolve: {
                personResp: function($http, $route, Person){
                    console.log("loaded the person response in the route def")
                    return Person.load($route.current.params.orcid)
                }
            }
        })
    })



    .controller("productPageCtrl", function($scope,
                                           $routeParams,
                                           $route,
                                           $location,
                                           $http,
                                           $mdDialog,
                                           $auth,
                                           Person,
                                           personResp){


        var possibleChannels = _.pluck(Person.d.sources, "source_name")
        var id
        id = $routeParams.id
        var product = _.findWhere(Person.d.products, {id: id})

        if (!product){
            $location.url("/u/" + Person.d.orcid_id + "/publications")
        }

        $scope.person = Person
        $scope.sources = product.sources
        $scope.product = product
        $scope.displayGenre = product.genre.replace("-", " ")
        $scope.d = {}


        console.log("$scope.product", $scope.product, $routeParams.filter)


        function makePostsWithRollups(posts){
            var sortedPosts = _.sortBy(posts, "posted_on")
            var postsWithRollups = []
            function makeRollupPost(){
                return {
                    source: 'tweetRollup',
                    posted_on: '',
                    count: 0,
                    tweets: []
                }
            }
            var currentRollup = makeRollupPost()
            _.each(sortedPosts, function(post){
                if (post.source == 'twitter'){

                    // we keep tweets as regular posts too
                    postsWithRollups.push(post)

                    // put the tweet in the rollup
                    currentRollup.tweets.push(post)

                    // rollup posted_on date will be date of *first* tweet in group
                    if (!currentRollup.posted_on){
                        currentRollup.posted_on = post.posted_on
                    }
                }
                else {
                    postsWithRollups.push(post)

                    // save the current rollup
                    if (currentRollup.tweets.length){
                        postsWithRollups.push(currentRollup)
                    }

                    // clear the current rollup
                    currentRollup = makeRollupPost()
                }
            })

            // there may be rollup still sitting around because no regular post at end
            if (currentRollup.tweets.length){
                postsWithRollups.push(currentRollup)
            }
            return postsWithRollups
        }

        $scope.posts = makePostsWithRollups(product.posts)
        $scope.mendeleySource = _.findWhere(product.sources, {source_name: "mendeley"})

        $scope.postsFilter = function(post){
            if ($scope.selectedChannel) {
                return post.source == $scope.selectedChannel.source_name
            }
            else { // we are trying to show unfiltered view

                // but even in unfiltered view we want to hide tweets.
                return post.source != 'twitter'

            }
        }

        $scope.postsSum = 0
        _.each($scope.sources, function(v){
            $scope.postsSum += v.posts_count
        })


        $scope.d.postsLimit = 20
        $scope.selectedChannel = _.findWhere($scope.sources, {source_name: $routeParams.filter})

        $scope.toggleSelectedChannel = function(channel){
            console.log("toggling selected channel", channel)
            var rootUrl = "u/" + Person.d.orcid_id + "/p/" + id
            if (channel.source_name == $routeParams.filter){
                $location.url(rootUrl)
            }
            else {
                $location.url(rootUrl + "/" + channel.source_name)
            }
        }

        $scope.setFulltextUrl = function(ev){
            console.log("stetting fulltext url for ", id)
            var confirm = $mdDialog.prompt()
                .clickOutsideToClose(true)
                .title('Add link to free fulltext')
                .textContent("(No free fulltext anywhere? Consider uploading this work to an open repository like Zenodo or Figshare.)")
                .placeholder("What's the free fulltext URL?")
                .targetEvent(ev)
                .ok('Okay!')
                .cancel('Cancel');

            $mdDialog.show(confirm).then(function(result) {
                Person.setFulltextUrl(id, result)


            }, function() {
                console.log("cancelled the setFulltextUrl dialog")
            });
        }




    })




angular.module('resourcesModule', [])
  .factory('Leaders', function($resource) {
    return $resource('api/leaderboard')
  })


  .factory('PackageResource', function($resource) {
    return $resource('/api/package/:namespace/:name')
  })
angular.module('badgeDefs', [
])

    .factory("BadgeDefs", function($http){

      var data = {}

      function load(){

        var url = "/api/badges"
        return $http.get(url).success(function(resp){

          // clear the data object
          for (var member in data) delete data[member];

          // put the response in the data object
          _.each(resp, function(v, k){
            data[k] = v
          })

        })
      }

      return {
        d: data,
        load: load
      }
    })
angular.module('currentUser', [
])



    .factory("CurrentUser", function($auth,
                                     $http,
                                     $rootScope,
                                     $q,
                                     $route,
                                     $location,
                                     $mdToast,
                                     $cookies,
                                     $timeout){
        
        var data = {}
        var isLoading = false
        var sendToIntercom = function(){
            // this is slow, but that's ok since it's async and doesn't affect the UX
            // only call it if they have an orcid_id since the call needs it
            if (data.orcid_id) {
                $http.get("api/person/" + data.orcid_id).success(function(resp) {
                    bootIntercom(resp)
                })
            }
        }

        var isAuthenticatedPromise = function(){
            // this is actually a synchronous method, it just returns
            //      a promise so it can be used in route definitions.
            var deferred = $q.defer()
            if ($auth.isAuthenticated()) {
                deferred.resolve()
            }
            else {
                console.log("user isn't logged in, so isAuthenticatedPromise() is rejecting promise.")
                deferred.reject()
            }
            return deferred.promise
        }



        var twitterAuthenticate = function (intent) {
            // send the user to twitter.com to authenticate
            // twitter will send them back to us from there.
            // @intent should be either "register" or "login".

            var redirectUri = window.location.origin + "/oauth/" + intent + "/twitter"

            console.log("authenticate with twitters!");

            // first ask our server to get the OAuth token that we use to create the
            // twitter URL that we will redirect the user too.

            $rootScope.progressbar.start() // it will take some time

            var baseUrlToGetOauthTokenFromOurServer = "/api/auth/twitter/request-token?redirectUri=";
            var baseTwitterLoginPageUrl = "https://api.twitter.com/oauth/authenticate?oauth_token="
            $http.get(baseUrlToGetOauthTokenFromOurServer + redirectUri).success(
                function(resp){
                    console.log("twitter request token", resp)
                    var twitterLoginPageUrl = baseTwitterLoginPageUrl + resp.oauth_token
                    window.location = twitterLoginPageUrl
                }
            )
        };

        var orcidAuthenticate = function (intent, orcidAlreadyExists) {
            // send the user to orcid.org to authenticate
            // orcid will send them back to us from there.
            // @intent should be either "register" or "login".
            // @orcidAlreadyExists (bool) lets us know whether to send you to
            //      the ORCID login screen or signup screen.

            var redirectUri = window.location.origin + "/oauth/" + intent + "/orcid"

            console.log("ORCID authenticate!", intent, orcidAlreadyExists)

            var authUrl = "https://orcid.org/oauth/authorize" +
                "?client_id=APP-QO42OBB0WJXS3322" +
                "&response_type=code" +
                "&scope=/authenticate" +
                "&redirect_uri=" + redirectUri

            if (orcidAlreadyExists){
                authUrl += "&show_login=true"
            }

            window.location = authUrl
            return true
        }

        function disconnectTwitter(){

            isLoading = true
            console.log("disconnect twitter!")
            $mdToast.show(
                $mdToast.simple()
                    .textContent("Disconnecting Twitter...")
                    .position("top")
                    .hideDelay(5000)
            )

            return $http.post("api/me/twitter/disconnect", {})
                .success(function(resp){
                    isLoading = false
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent("Done!")
                            .position("top")
                    )
                    setFromToken(resp.token)
                })
        }

        function sendHome(){
            console.log("calling sendToCorrectPage() with this data", data)
            var url
            var currentPath = $location.path()
            console.log("currentPath", currentPath)


            if (data.finished_wizard && isMyProfile(currentPath)){
                url = currentPath
            }

            else if (data.finished_wizard){
                url = "/u/" + data.orcid_id
            }

            else if (data.num_products > 0){
                url = "/wizard/confirm-publications"
            }

            else if (data.orcid_id){
                url = "/wizard/add-publications"
            }

            else {
                url = "/wizard/connect-orcid"
            }

            if (currentPath == url ){
                return false
            }
            else {
                $location.url(url)
                return true
            }
        }

        function isMyProfile(url){
            if (!data.orcid_id){
                return false
            }
            return url.indexOf(data.orcid_id) > -1
        }




        function sendHomePromise(requireLogin){
            var deferred = $q.defer()

            if (!isLoggedIn()){
                if (requireLogin){
                    $location.url("login")
                }
                else {
                    deferred.resolve()
                }
            }

            else {
                var redirecting = sendHome()

                console.log("sendHomePromise redirceing=", redirecting)

                if (!redirecting){
                    deferred.resolve()
                }
            }

            return deferred.promise
        }


        function isLoggedIn(returnPromise){
            if (returnPromise){
                var deferred = $q.defer()
                if ($auth.isAuthenticated()) {
                    deferred.resolve()
                }
                else {
                    deferred.reject()
                }
                return deferred.promise
            }


            return $auth.isAuthenticated()
        }

        function setProperty(k, v){
            var data = {}
            data[k] = v
            return $http.post("api/me", data)
                .success(function(resp){
                    setFromToken(resp.token)
                })
                .error(function(resp){
                    console.log("we tried to set a thing, but it didn't work", data, resp)
                })
        }


        function logout(){
            $auth.logout()
            _.each(data, function(v, k){
                delete data[k]
            })
            Intercom('shutdown')
            return true
        }

        function boot(){
            _.each($auth.getPayload(), function(v, k){
                data[k] = v
            })
            return reloadFromServer()
        }

        function reloadFromServer(){
            console.log("reloading from server")
            if (!isLoggedIn()){
                console.log("user is not logged in")
                return false
            }

            $http.get("api/me").success(function(resp){
                console.log("refreshing data in CurrentUser", resp)
                setFromToken(resp.token)
            })
        }

        function profileLink(){
            var url = "https://impactstory.org/u/"
            if (data.twitter_screen_name) {
                url += data.twitter_screen_name
            }
            else {
                url += data.orcid_id
            }
            return url
        }


        function bootIntercom(person){
            var percentOA = person.percent_fulltext
            if (percentOA === null) {
                percentOA = undefined
            }
            else {
                percentOA * 100
            }
    
            var intercomInfo = {
                // basic user metadata
                app_id: "z93rnxrs",
                name: person._full_name,
                user_id: person.orcid_id, // orcid ID
                claimed_at: moment(person.claimed_at).unix(),
                email: person.email,
    
                // user stuff for analytics
                percent_oa: percentOA,
                num_posts: person.num_posts,
                num_mentions: person.num_mentions,
                num_products: person.products.length,
                num_badges: person.badges.length,
                num_twitter_followers: person.num_twitter_followers,
                campaign: person.campaign,
                fresh_orcid: person.fresh_orcid,
                landing_page: $cookies.get("customLandingPage"),
    
                // we don't send person responses for deleted users (just 404s).
                // so if we have a person response, this user isn't deleted.
                // useful for when users deleted profile, then re-created later.
                is_deleted: false
    
            }

            console.log("sending to intercom", intercomInfo)
            window.Intercom("boot", intercomInfo)
        } 

        function setFromToken(token){
            $auth.setToken(token) // synchronous
            _.each($auth.getPayload(), function(v, k){
                data[k] = v
            })

            sendToIntercom()
        }

        return {
            isAuthenticatedPromise: isAuthenticatedPromise,
            twitterAuthenticate: twitterAuthenticate,
            orcidAuthenticate: orcidAuthenticate,
            disconnectTwitter: disconnectTwitter,
            setFromToken: setFromToken,
            sendHome: sendHome,
            sendHomePromise: sendHomePromise,
            setProperty: setProperty,
            d: data,
            logout: logout,
            profileLink: profileLink,
            isLoggedIn: isLoggedIn,
            reloadFromServer: reloadFromServer,
            boot: boot,
            isMyProfile: isMyProfile,
            isLoading: function(){
                return !!isLoading
            }
        }
    })
angular.module("numFormat", [])

    .factory("NumFormat", function($location){

        var commas = function(x) { // from stackoverflow
            if (!x) {
                return x
            }
            var parts = x.toString().split(".");
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return parts.join(".");
        }


        var short = function(num, fixedAt){
            if (typeof num === "string"){
                return num  // not really a number
            }

            // from http://stackoverflow.com/a/14994860/226013
            if (num === null){
                return 0
            }
            if (num === 0){
                return 0
            }

            if (num >= 1000000) {
                return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
            }
            if (num >= 100000) { // no decimal if greater than 100thou
                return (num / 1000).toFixed(0).replace(/\.0$/, '') + 'k';
            }

            if (num >= 1000) {
                return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
            }


            if (num < 1) {
                return Math.round(num * 100) / 100;  // to two decimals
            }

            return Math.ceil(num);
        }

        var round = function(num){
            return Math.round(num)
        }

        var doubleUrlEncode = function(str){
            return encodeURIComponent( encodeURIComponent(str) )
        }

        // from http://cwestblog.com/2012/09/28/javascript-number-getordinalfor/
        var ordinal = function(n) {
            n = Math.round(n)
            var s=["th","st","nd","rd"],
                v=n%100;
            return n+(s[(v-20)%10]||s[v]||s[0]);
        }

        var decimalToPerc = function(decimal, asOrdinal){
            var ret = Math.round(decimal * 100)
            if (asOrdinal){
                ret = ordinal(ret)
            }
            return ret
        }
        return {
            short: short,
            commas: commas,
            round: round,
            ordinal: ordinal,
            doubleUrlEncode: doubleUrlEncode,
            decimalToPerc: decimalToPerc

        }
    });
angular.module('person', [
])



    .factory("Person", function($http, $q, $route, $rootScope, CurrentUser){

        var data = {}
        var isLoading = false
        var badgeSortLevel = {
            "gold": 1,
            "silver": 2,
            "bronze": 3
        }
        var beltDescriptions = {
            white: "initial",
            yellow: "promising",
            orange: "notable",
            brown: "extensive",
            black: "exceptional"
        }

        function load(orcidId, force){
            console.log("loading the Person")


            // if the data for this profile is already loaded, just return it
            // unless we've been told to force a refresh from the server.
            if (data.orcid_id == orcidId && !force){
                console.log("Person Service getting from cache:", orcidId)
                return $q.when(data)
            }


            var url = "/api/person/" + orcidId
            console.log("Person Service getting from server:", orcidId)
            $rootScope.progressbar.start()
            isLoading = true
            return $http.get(url)
                .success(function(resp){

                    // clear the data object and put the new data in
                    for (var member in data) delete data[member];
                    overwriteData(resp)
                    $rootScope.progressbar.complete()
                    isLoading = false

                })
                .error(function(resp){
                    $rootScope.progressbar.complete()
                    isLoading = false

                })
        }

        function overwriteData(newData){
            // put the response in the data object
            _.each(newData, function(v, k){
                data[k] = v
            })

            // add computed properties

            // total posts
            var postCounts = _.pluck(data.sources, "posts_count")
            data.numPosts = postCounts.reduce(function(a, b){return a + b}, 0)

            // date of earliest publication
            var earliestPubYear = _.min(_.pluck(data.products, "year"))
            if (earliestPubYear > 0 && earliestPubYear <= 2015) {
                data.publishingAge = 2016 - earliestPubYear
            }
            else {
                data.publishingAge = 1
            }
        }

        function setFulltextUrl(productId, fulltextUrl) {
            _.each(data.products, function(myProduct){
                if (myProduct.id == productId){
                    myProduct.fulltext_url = fulltextUrl
                }
            });
            var apiUrl = "/api/person/" + data.orcid_id
            var postBody = {
                product: {
                    id: productId,
                    fulltext_url: fulltextUrl
                }
            }

            $http.post(apiUrl, postBody)
                .success(function(resp){
                    console.log("we set the fulltext url!", resp)
                    overwriteData(resp)

                    // todo: figure out if we actually need this
                    $route.reload()
                })
                .error(function(resp){
                    console.log("we failed to set the fulltext url", resp)
                    $route.reload()
                })

        }


        function getBadgesWithConfigs(configDict) {
            var ret = []
            _.each(data.badges, function(myBadge){
                var badgeDef = configDict[myBadge.name]
                var enrichedBadge = _.extend(myBadge, badgeDef)
                enrichedBadge.sortLevel = badgeSortLevel[enrichedBadge.level]
                ret.push(enrichedBadge)
            })

            return ret
        }

        function belongsToCurrentUser(){
            if (!CurrentUser.isLoggedIn()) {
                return false
            }
            return CurrentUser.d.id == data.id
        }


        return {
            d: data,
            load: load,
            badgesToShow: function(){
                return _.filter(data.badges, function(badge){
                    return !!badge.show_in_ui
                })
            },
            getBadgesWithConfigs: getBadgesWithConfigs,
            setFulltextUrl: setFulltextUrl,
            reload: function(){
                return load(data.orcid_id, true)
            },
            clear:function(){
                for (var member in data) delete data[member];
            },
            belongsToCurrentUser: belongsToCurrentUser,
            isLoading: function(){
                return !!isLoading
            }
        }
    })
angular.module('settingsPage', [
    'ngRoute'
])



    .config(function($routeProvider) {
        $routeProvider.when('/me/settings', {
            templateUrl: 'settings-page/settings-page.tpl.html',
            controller: 'settingsPageCtrl',
            resolve: {
                isAuth: function($q, CurrentUser){
                    return CurrentUser.isLoggedIn(true)
                }
            }
        })
    })



    .controller("settingsPageCtrl", function($scope,
                                             $rootScope,
                                             $auth,
                                             $route,
                                             $location,
                                             $http,
                                             Person,
                                             CurrentUser){

        console.log("the settings page loaded")
        var myOrcidId = CurrentUser.d.orcid_id
        $scope.orcidId = myOrcidId
        $scope.givenNames = CurrentUser.d.given_names
        $scope.currentUser = CurrentUser


        // launching for the DORA anniv in december :)
        $scope.dorafied = null
        //$http.get("api/me")
        //    .success(function(resp){
        //        console.log("got stuff back from /me", resp)
        //        if (resp.promos.dorafy){
        //            $scope.dorafied = true
        //        }
        //    })




        $scope.wantToDelete = false
        $scope.deleteProfile = function() {
            $http.delete("/api/me")
                .success(function(resp){
                    // let Intercom know
                    window.Intercom("update", {
                        user_id: myOrcidId,
                        is_deleted: true
                    })

                    CurrentUser.logout()
                    $location.path("/")
                    alert("Your profile has been deleted.")
                })
                .error(function(){
                    alert("Sorry, something went wrong!")
                })
        }


        $scope.syncState = 'ready'

        $scope.pullFromOrcid = function(){
            console.log("ah, refreshing!")
            $scope.syncState = "working"
            $http.post("/api/me/refresh")
                .success(function(resp){
                    CurrentUser.setFromToken(resp.token)

                    // force a reload of the person
                    Intercom('trackEvent', 'synced-to-edit');
                    Person.load(myOrcidId, true).then(
                        function(resp){
                            $scope.syncState = "success"
                            console.log("we reloaded the Person after sync")
                        }
                    )
                })
        }

        $scope.setDorafy = function(dorafy){
            console.log("dorafy!", dorafy)
            $scope.doraState = 'working'
            var postData = {
                dorafy: true
            }
            $http.post("api/me/promos", postData)
                .success(function(resp){
                    $scope.doraState = 'done'
                    console.log("set the dorafy!", resp)
                })
        }

    })













angular.module('staticPages', [
    'ngRoute',
    'satellizer',
    'ngMessages'
])

    .config(function ($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: "static-pages/landing.tpl.html",
            controller: "LandingPageCtrl",
            resolve: {
                redirect: function(CurrentUser){
                    return CurrentUser.sendHomePromise(false)
                }
            }
        })
    })

    .config(function ($routeProvider) {
        $routeProvider.when('/landing/:landingPageName', {
            templateUrl: "static-pages/landing.tpl.html",
            controller: "LandingPageCtrl",
            resolve: {
                redirect: function(CurrentUser){
                    return CurrentUser.sendHomePromise(false)
                }
            }
        })
    })





    .config(function ($routeProvider) {
        $routeProvider.when('/page-not-found', {
            templateUrl: "static-pages/page-not-found.tpl.html",
            controller: "PageNotFoundCtrl"
        })
    })

    .controller("PageNotFoundCtrl", function($scope){
        console.log("PageNotFound controller is running!")

    })



    .controller("LandingPageCtrl", function ($scope,
                                             $mdDialog,
                                             $cookies,
                                             $rootScope,
                                             $routeParams,
                                             $timeout) {

        if ($routeParams.landingPageName) {
            console.log("this is a custom landing page: ", $routeParams.landingPageName)
            $scope.customPageName = $routeParams.landingPageName
            if ($routeParams.landingPageName == "open"){
                $cookies.put("customLandingPage", $routeParams.landingPageName)
            }

        }


        $scope.global.showBottomStuff = false;
        console.log("landing page!", $scope.global)
        $scope.global.isLandingPage = true

        var orcidModalCtrl = function($scope){
            console.log("IHaveNoOrcidCtrl ran" )
            $scope.modalAuth = function(){
                $mdDialog.hide()
            }
        }

        $scope.noOrcid = function(ev){
            $mdDialog.show({
                controller: orcidModalCtrl,
                templateUrl: 'orcid-dialog.tmpl.html',
                clickOutsideToClose:true,
                targetEvent: ev
            })
                .then(
                function(){
                    $rootScope.authenticate("signin")
                },
                function(){
                    console.log("they cancelled the dialog")
                }
            )


        }

    })
    .controller("IHaveNoOrcidCtrl", function($scope){
        console.log("IHaveNoOrcidCtrl ran" )
    })











angular.module('wizard', [
    'ngRoute',
    'satellizer',
    'ngMessages'
])

    .config(function ($routeProvider) {
        $routeProvider.when('/wizard/connect-orcid', {
            templateUrl: "wizard/connect-orcid.tpl.html",
            controller: "ConnectOrcidPageCtrl",
            resolve: {
                redirect: function(CurrentUser){

                    return CurrentUser.sendHomePromise(true)
                }
            }
        })
    })


    .config(function ($routeProvider) {
        $routeProvider.when('/wizard/confirm-publications', {
            templateUrl: "wizard/confirm-publications.tpl.html",
            controller: "ConfirmPublicationsCtrl",
            resolve: {
                redirect: function(CurrentUser){
                    return CurrentUser.sendHomePromise(true)
                }
            }
        })
    })

    .config(function ($routeProvider) {
        $routeProvider.when('/wizard/add-publications', {
            templateUrl: "wizard/add-publications.tpl.html",
            controller: "AddPublicationsCtrl"

        })
    })



    .controller("ConnectOrcidPageCtrl", function($scope, $location, $http, $auth){
        $scope.global.showBottomStuff = false
        $scope.global.hideHeader = true
        $scope.global.isFocusPage = true


        //if ($auth.getPayload().orcid_id){
        //    console.log("we've got their ORCID already")
        //    if ($auth.getPayload().num_products){
        //        console.log("they are all set, redirecting to their profile")
        //        $location.url("u/" + $auth.getPayload().orcid_id)
        //    }
        //    else {
        //        console.log("no products! redirecting to add-products")
        //        $location.url("wizard/add-products")
        //    }
        //}




        console.log("WelcomePageCtrl is running!")
        $scope.hasOrcid = null
        $scope.doYouHaveAnOrcid = function(answer){
            console.log("setting doYouHaveAnOrcid", answer)
            $scope.hasOrcid = answer
        }
    })


    .controller("ConfirmPublicationsCtrl", function($scope, $location, $http, $auth, CurrentUser){
        console.log("ConfirmPublicationsCtrl is running!")
        $scope.global.showBottomStuff = false
        $scope.global.hideHeader = true
        $scope.global.isFocusPage = true

        // todo add this to the template.
        $scope.confirm = function(){
            console.log("finishProfile()")
            $scope.actionSelected = "finish-profile" // foo

            CurrentUser.setProperty("finished_wizard", true).then(
                function(x){
                    console.log("finished setting finished_wizard", x)
                }
            )

            // this runs concurrently with the call to the server to set finished_wizard just above.
            $http.post("api/me/refresh", {})
                .success(function(resp){
                    console.log("successfully refreshed everything ")
                    CurrentUser.setFromToken(resp.token)
                    CurrentUser.sendHome()

                })
                .error(function(resp){
                    console.log("we tried to refresh profile, but something went wrong :(", resp)
                    $scope.actionSelected = null
                })

        }
    })

    .controller("AddPublicationsCtrl", function($scope, $location, $http, $auth, CurrentUser, Person){
        console.log("AddPublicationsCtrl is running!")
        $scope.global.showBottomStuff = false
        $scope.global.hideHeader = true
        $scope.global.isFocusPage = true

        $scope.state = "prompting"
        function checkForNewProducts(){
            $scope.state = "polling"
            console.log("checking for new products")
            $http.post("api/me/orcid/refresh", {}).success(function(resp){
                console.log("got stuff back from api/me/orcid")
                var oldNumberOfProducts = CurrentUser.d.num_products
                CurrentUser.setFromToken(resp.token)
                console.log("used to have " + oldNumberOfProducts + " products, now " + CurrentUser.d.num_products)

                if ((CurrentUser.d.num_products>=100) || (oldNumberOfProducts != CurrentUser.d.num_products)){
                    console.log("found the new products! assuming we're done getting products now.")
                    $scope.state = "making-profile"
                    $scope.num_products_added = CurrentUser.d.num_products - oldNumberOfProducts


                    // profile has all products now, but we need to get metrics. refresh it.
                    $http.post("api/me/refresh", {})
                        .success(function(resp){
                            console.log("successfully refreshed everything ")
                            CurrentUser.setFromToken(resp.token)

                            // have save that the wizard is done before sending home.
                            // this is three callbacks deep at this point, so good to refactor by
                            // chaining promises later.
                            CurrentUser.setProperty("finished_wizard", true).then(
                                function(x){
                                    console.log("finished setting finished_wizard", x)
                                    console.log("reloading the current user")

                                    // a hack because if you were already on your own person page
                                    // before, now you are gonna get sent back, and since it's got
                                    // the same ID as before, it's gonna use the cached version, and
                                    // you won't see your new products.
                                    // So.
                                    // clears out the Person obj first.
                                    Person.clear()
                                    CurrentUser.sendHome()
                                }
                            )

                        })
                        .error(function(resp){
                            console.log("we tried to refresh profile, but something went wrong :(", resp)
                        })
                }
                else {
                    // no change, let's keep checking.
                    return checkForNewProducts()
                }
            })
        }


        $scope.start = function(){
            console.log("start!")
            $scope.polling = true
            checkForNewProducts()
        }
    })











angular.module('templates.app', ['about-pages/about-badges.tpl.html', 'about-pages/about-data.tpl.html', 'about-pages/about-legal.tpl.html', 'about-pages/about-orcid.tpl.html', 'about-pages/about.tpl.html', 'about-pages/sample.tpl.html', 'about-pages/search.tpl.html', 'auth/login.tpl.html', 'auth/oauth.tpl.html', 'auth/orcid-login.tpl.html', 'auth/twitter-login.tpl.html', 'footer/footer.tpl.html', 'helps.tpl.html', 'loading.tpl.html', 'person-page/person-page-text.tpl.html', 'person-page/person-page.tpl.html', 'product-page/product-page.tpl.html', 'settings-page/settings-page.tpl.html', 'sidemenu.tpl.html', 'static-pages/landing.tpl.html', 'static-pages/page-not-found.tpl.html', 'wizard/add-publications.tpl.html', 'wizard/confirm-publications.tpl.html', 'wizard/connect-orcid.tpl.html']);

angular.module("about-pages/about-badges.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("about-pages/about-badges.tpl.html",
    "<div class=\"page about-badges\">\n" +
    "    <h2>Impactstory achievements</h2>\n" +
    "    <div class=\"intro\">\n" +
    "        <p>Achievements are a way of looking beyond the numbers to find stories that matter:\n" +
    "            stories the buzz your research is generating, the level of engagement with your work,\n" +
    "            your openness, and some lighthearted fun from time to time.\n" +
    "        </p>\n" +
    "        <p>\n" +
    "            Most achievements have levels\n" +
    "            based on how hard they are to get, based on our sample of thirty thousand researchers\n" +
    "            with an <a href=\"orcid.org\">ORCID</a> profile:\n" +
    "        </p>\n" +
    "\n" +
    "\n" +
    "        <table>\n" +
    "            <tr>\n" +
    "                <td class=\"gold badge-name\">\n" +
    "                    <i class=\"fa fa-trophy\"></i>\n" +
    "                    Gold level\n" +
    "                </td>\n" +
    "                <td>Top 10% of researchers</td>\n" +
    "            </tr>\n" +
    "            <tr>\n" +
    "                <td class=\"silver badge-name\">\n" +
    "                    <i class=\"fa fa-certificate\"></i>\n" +
    "                    Silver level\n" +
    "                </td>\n" +
    "                <td>Top 25% of researchers</td>\n" +
    "            </tr>\n" +
    "            <tr>\n" +
    "                <td class=\"bronze badge-name\">\n" +
    "                    <i class=\"fa fa-bookmark\"></i>\n" +
    "                    Bronze level\n" +
    "                </td>\n" +
    "                <td>Top half of researchers</td>\n" +
    "            </tr>\n" +
    "        </table>\n" +
    "    </div>\n" +
    "    <div class=\"main\">\n" +
    "\n" +
    "        <div class=\"badge-group\" ng-repeat=\"badgeGroup in badgeGroups | orderBy: 'sortLevel'\">\n" +
    "            <div class=\"about {{ badgeGroup.name }}\">\n" +
    "                <h4 class=\"badge-group {{ badgeGroup.name }}\" id=\"{{ badgeGroup.name }}\">\n" +
    "                    <i class=\"fa fa-{{ getBadgeIcon(badgeGroup.name) }}\"></i>\n" +
    "                    <span class=\"name\">{{ badgeGroup.name }}</span>\n" +
    "                </h4>\n" +
    "\n" +
    "\n" +
    "                <p class=\"def buzz\" ng-show=\"badgeGroup.name=='buzz'\">\n" +
    "                    <strong>Buzz</strong> is the volume of discussion (good and bad)\n" +
    "                    around your research. It's a good&mdash;if coarse&mdash;measure of online interest around\n" +
    "                    your work.\n" +
    "                </p>\n" +
    "                <p class=\"def engagement\" ng-show=\"badgeGroup.name=='engagement'\">\n" +
    "                    <strong>Engagement</strong> is about <em>how</em> people are interacting with your\n" +
    "                        research online. What's the quality of the discussion, who is having it, and where?\n" +
    "                </p>\n" +
    "                <p class=\"def openness\" ng-show=\"badgeGroup.name=='openness'\">\n" +
    "                    <strong>Openness</strong> makes it easy for people to read and use\n" +
    "                    your research.\n" +
    "                </p>\n" +
    "                <p class=\"def fun\" ng-show=\"badgeGroup.name=='fun'\">\n" +
    "                    <strong>Fun</strong> achievements are Not So Serious.\n" +
    "                </p>\n" +
    "            </div>\n" +
    "            <div class=\"badges-wrapper row\"\n" +
    "                 ng-include=\"'badge-item.tpl.html'\"\n" +
    "                 ng-repeat=\"badge in badgeGroup.badges\">\n" +
    "\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "\n" +
    "    </div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "</div>");
}]);

angular.module("about-pages/about-data.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("about-pages/about-data.tpl.html",
    "<div class=\"page about about-data\">\n" +
    "    <h2>About the data</h2>\n" +
    "\n" +
    "\n" +
    "    <h3 id=\"boost-your-oa-score\">Boost your #OAscore</h3>\n" +
    "    <div>\n" +
    "        <p>\n" +
    "            You can boost the percentage of your work that's free to read by uploading copies of\n" +
    "            paywalled papers to an open repository.\n" +
    "        </p>\n" +
    "        <ol>\n" +
    "            <li>\n" +
    "                First, look through your publications list\n" +
    "                here on Impactstory. Find a publication that doesn't have \"[full text]\" next to it.\n" +
    "            </li>\n" +
    "            <li>\n" +
    "                Go to an open repository like <a href=\"http://figshare.com\">figshare</a> or\n" +
    "                <a href=\"http://zenodo.org\">Zenodo</a> and upload\n" +
    "                the paper you've chosen. <a\n" +
    "                    href=\"http://blog.impactstory.org/impact-challenge-data-repository/\">Here's more detailed instructions.</a>\n" +
    "            </li>\n" +
    "            <li>Once you've uploaded your (formerly!) paywalled paper, note the new open URL you've created.\n" +
    "            </li>\n" +
    "            <li>\n" +
    "                Come back to Impactstory\n" +
    "                and view your publications list. Click on the title of the paper you've uploaded. Paste your new open URL into the \"Add a link to free fulltext\"\n" +
    "                field at the top of the page.\n" +
    "            </li>\n" +
    "            <li>\n" +
    "                Done! When you view your profile you'll see your new higher score\n" +
    "                (you may need to wait a few seconds for it to recalculate). Tweet it for the world to see!\n" +
    "            </li>\n" +
    "        </ol>\n" +
    "        <p>\n" +
    "            Need any help? Contact us <a href=\"http://twitter.com/impactstory\">on Twitter</a> or open a help\n" +
    "            ticket by clicking the help icon at the bottom right of your screen.\n" +
    "        </p>\n" +
    "    </div>\n" +
    "\n" +
    "\n" +
    "    <h3 id=\"data-sources\">Data sources</h3>\n" +
    "    <ul>\n" +
    "        <li>\n" +
    "            <a href=\"http://www.altmetric.com\">Altmetric</a> supplies most of our data for tracking the online\n" +
    "            impact of publications.\n" +
    "        </li>\n" +
    "        <li>\n" +
    "            <a href=\"https://www.base-search.net/\">BASE</a> helps us find free fulltext for articles.\n" +
    "        </li>\n" +
    "        <li>\n" +
    "            <a href=\"http://dev.mendeley.com\">Mendeley</a> gives us information about how articles are saved on their\n" +
    "            reference manager platform.\n" +
    "        </li>\n" +
    "        <li>\n" +
    "            <a href=\"http://www.crossref.org\">CrossRef</a> helps us find metadata for articles that have DOIs.\n" +
    "        </li>\n" +
    "        <li>\n" +
    "            <a href=\"http://www.orcid.org\">ORCID</a> provides researcher identity management services that form the backbone\n" +
    "            of our profile system.\n" +
    "        </li>\n" +
    "        <li>\n" +
    "            <a href=\"http://twitter.com\">Twitter</a> supplies a convenient identity provider for signin (also, more Twitter\n" +
    "            analytics are on the roadmap).\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "\n" +
    "    <!--\n" +
    "    <h3 id=\"metrics\">Metrics</h3>\n" +
    "    <p>\n" +
    "        We're currently working on this section. Stay tuned...\n" +
    "    </p>\n" +
    "    -->\n" +
    "\n" +
    "    <h3 id=\"publications\">Publications</h3>\n" +
    "    <p>\n" +
    "        Impactstory uses ORCID to find and import your scholarly works.\n" +
    "        Are you missing publications on Impactstory? Here's how to fix it.\n" +
    "    </p>\n" +
    "    <div class=\"ways-to-fix-missing-publications\">\n" +
    "        <h4>\n" +
    "            <strong>1.</strong>\n" +
    "            Get your publications into your ORCID</h4>\n" +
    "        <p>\n" +
    "            Since we import from ORCID, if your ORCID is missing articles then so are we.\n" +
    "            Visit your ORCID to make sure it's got all your work. If not,\n" +
    "            use their <em>Scopus</em> importer to remedy that situation:\n" +
    "            <img src=\"static/img/gif/orcid-import-scopus.gif\" width=\"400\">\n" +
    "        </p>\n" +
    "\n" +
    "        <h4>\n" +
    "            <strong>2.</strong>\n" +
    "            Ensure your works are Public on ORCID\n" +
    "        </h4>\n" +
    "        <p>\n" +
    "            Once you've got all your publications on your ORCID, we need to make sure\n" +
    "            Impactstory can see them. To do that, make sure their privacy is set to Public.\n" +
    "            If not, it's easy to fix:\n" +
    "            <img src=\"static/img/gif/orcid-set-public.gif\" width=\"400\">\n" +
    "        </p>\n" +
    "        <h4>\n" +
    "            <strong>3.</strong>\n" +
    "            Re-sync Impactstory ORCID\n" +
    "        </h4>\n" +
    "        <p>\n" +
    "           If you've made any changes to your ORCID, they'll get synced over to Impactstory\n" +
    "            automatically within 24 hours. Or if you're feeling like some instant gratification,\n" +
    "            you can sync manually from your Settings page: just click the\n" +
    "            <i class=\"fa fa-gear\"></i> icon at the top right of the page, then\n" +
    "            click \"Sync with my ORCID now.\"\n" +
    "        </p>\n" +
    "        <!--\n" +
    "        <h4><i class=\"fa fa-check\"></i>Get DOIs for your remaining works</h4>\n" +
    "        <p>\n" +
    "            Some small publishers don't assign DOIs. Neither do YouTube, SlideShare, or\n" +
    "            other mainstream content hosts. You can't fix this for the original versions.\n" +
    "\n" +
    "            But you can archive your publications\n" +
    "            in a <em>repository</em> to get a DOI for the new, persistently-archived version. Then you can import the new DOI into\n" +
    "            ORCID and Impactstory as normal. Here's an article detailing how:\n" +
    "            <a href=\"http://blog.impactstory.org/impact-challenge-dois/\">\n" +
    "                Archive your articles, slides, datasets, and more.\n" +
    "            </a>\n" +
    "        </p>\n" +
    "        -->\n" +
    "    </div>\n" +
    "\n" +
    "\n" +
    "</div>");
}]);

angular.module("about-pages/about-legal.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("about-pages/about-legal.tpl.html",
    "<div class=\"page about-legal\">\n" +
    "    <h2>Coming real soon</h2>\n" +
    "\n" +
    "</div>");
}]);

angular.module("about-pages/about-orcid.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("about-pages/about-orcid.tpl.html",
    "<div class=\"page about about-orcid\">\n" +
    "    <h2>Impactstory and ORCID</h2>\n" +
    "\n" +
    "    <h3>Auto-generated profiles</h3>\n" +
    "    <p>\n" +
    "        ORCID users control all access to their data, but many ORCID users choose to make their data public.\n" +
    "    </p>\n" +
    "    <p>\n" +
    "        We've used open data from public ORCID profiles to help us auto-generate some Impactstory profiles. These\n" +
    "        auto-generated profiles help us build robust percentile information, since we can compare any given\n" +
    "        user to a nice large set of scholars at large.\n" +
    "    </p>\n" +
    "    <p>\n" +
    "        If you've got an auto-generated ORCID profile, you'll probably want to log in to claim it&mdash;it's\n" +
    "        as simple as logging in to your ORCID account and takes just a few seconds. Once you've logged in,\n" +
    "        you can get start getting email updates on new online impacts, as well as also modify or delete your\n" +
    "        profile if you'd like.\n" +
    "    </p>\n" +
    "    <p>\n" +
    "        If you have any trouble logging in, just drop us a line and we'll be glad to help.\n" +
    "    </p>\n" +
    "\n" +
    "\n" +
    "\n" +
    "</div>");
}]);

angular.module("about-pages/about.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("about-pages/about.tpl.html",
    "<div class=\"page about about-page\" id=\"about\">\n" +
    "\n" +
    "   <div class=\"wrapper\">\n" +
    "      <h2 class=\"infopage-heading\">About</h2>\n" +
    "\n" +
    "\n" +
    "      <p>Impactstory is an open-source website that helps researchers explore and share the the\n" +
    "          online impact of their research.\n" +
    "      </p>\n" +
    "       <p>\n" +
    "\n" +
    "          By helping researchers tell data-driven stories about their work,\n" +
    "          we're helping to build a new scholarly reward system that values and encourages web-native scholarship.\n" +
    "          We’re funded by the National Science Foundation and the Alfred P. Sloan Foundation and\n" +
    "          incorporated as a 501(c)(3) nonprofit corporation.\n" +
    "       </p>\n" +
    "       <p>\n" +
    "           In addition to the <a href=\"http://impactstory.org\">Impactstory application</a>, the Impactstory team has built\n" +
    "           <a href=\"http://unpaywall.org\">Unpaywall</a>, <a href=\"http://oadoi.org\">oaDOI</a>, and <a href=\"http://depsy.org\">Depsy</a>.\n" +
    "       </p>\n" +
    "       <p>\n" +
    "           Contact us via <a href=\"mailto:team@impactstory.org\">email</a> or\n" +
    "           <a href=\"http://twitter.com/impactstory\">Twitter.</a>\n" +
    "\n" +
    "       </p>\n" +
    "       <p>\n" +
    "           Learn more on our\n" +
    "           <a href=\"about/data\">data sources</a> and\n" +
    "           <a href=\"about/achievements\">achievements</a> pages.\n" +
    "       </p>\n" +
    "\n" +
    "      <h3 id=\"team\">team</h3>\n" +
    "\n" +
    "      <div class=\"team-member first\">\n" +
    "         <img src=\"/static/img/heather.jpg\" height=100/>\n" +
    "         <p><strong>Heather Piwowar</strong> is a cofounder of Impactstory and a leading researcher in research data availability and data reuse. She wrote one of the first papers measuring the <a href=\"http://www.plosone.org/article/info:doi/10.1371/journal.pone.0000308\">citation benefit of publicly available research data</a>, has studied  <a href=\"http://www.plosone.org/article/info:doi/10.1371/journal.pone.0018657\">patterns in  data archiving</a>, <a href=\"https://peerj.com/preprints/1/\">patterns of data reuse</a>, and the <a href=\"http://researchremix.wordpress.com/2010/10/12/journalpolicyproposal\">impact of journal data sharing policies</a>.</p>\n" +
    "\n" +
    "         <p>Heather has a bachelor’s and master’s degree from MIT in electrical engineering, 10 years of experience as a software engineer, and a Ph.D. in Biomedical Informatics from the U of Pittsburgh.  She is an <a href=\"http://www.slideshare.net/hpiwowar\">frequent speaker</a> on research data archiving, writes a well-respected <a href=\"http://researchremix.wordpress.com\">research blog</a>, and is active on twitter (<a href=\"http://twitter.com/researchremix\">@researchremix</a>). </p>\n" +
    "      </div>\n" +
    "\n" +
    "      <div class=\"team-member subsequent\">\n" +
    "         <img src=\"/static/img/jason.jpg\" height=100/>\n" +
    "         <p><strong>Jason Priem</strong> is a cofounder of Impactstory and a doctoral student in information science (currently on leave of absence) at the University of North Carolina-Chapel Hill. Since <a href=\"https://twitter.com/jasonpriem/status/25844968813\">coining the term \"altmetrics,\"</a> he's remained active in the field, organizing the annual <a href=\"http:altmetrics.org/altmetrics12\">altmetrics workshops</a>, giving <a href=\"http://jasonpriem.org/cv/#invited\">invited talks</a>, and publishing <a href=\"http://jasonpriem.org/cv/#refereed\">peer-reviewed altmetrics research.</a></p>\n" +
    "\n" +
    "         <p>Jason has contributed to and created several open-source software projects, including <a href=\"http://www.zotero.org\">Zotero</a> and <a href=\"http://feedvis.com\">Feedvis</a>, and has experience and training in art, design, and information visualisation.  Sometimes he writes on a <a href=\"http://jasonpriem.org/blog\">blog</a> and <a href=\"https://twitter.com/#!/jasonpriem\">tweets</a>.</p>\n" +
    "      </div>\n" +
    "\n" +
    "      <div class=\"clearfix\"></div>\n" +
    "\n" +
    "\n" +
    "      <h3 id=\"history\">history</h3>\n" +
    "      <p>Impactstory began life as total-impact, a hackathon project at the Beyond Impact workshop in 2011. As the hackathon ended, a few of us migrated into a hotel hallway to continue working, eventually completing a 24-hour coding marathon to finish a prototype. Months of spare-time development followed, then funding.  We’ve got the same excitement for Impactstory today.</p>\n" +
    "\n" +
    "      <p>In early 2012, Impactstory was given £17,000 through the <a href=\"http://beyond-impact.org/\">Beyond Impact project</a> from the <a href=\"http://www.soros.org/\">Open Society Foundation</a>.  Today Impactstory is funded by the <a href=\"http://sloan.org/\">Alfred P. Sloan Foundation</a>, first through <a href=\"http://blog.impactstory.org/2012/03/29/20131290500/\">a $125,000 grant</a> in mid 2012 and then <a href=\"http://blog.impactstory.org/2013/06/17/sloan/\">a two-year grant for $500,000</a> starting in 2013.  We also received <a href=\"http://blog.impactstory.org/2013/09/27/impactstory-awarded-300k-nsf-grant/\">a $300,000 grant</a> from the National Science Foundation to study how automatically-gathered impact metrics can improve the reuse of research software. </p>\n" +
    "\n" +
    "      <h3 id=\"why\">philosophy</h3>\n" +
    "      <p>As a philanthropically-funded not-for-profit, we're in this because we believe open altmetrics are key for building the coming era of Web-native science. We're committed to:</p>\n" +
    "      <ul>\n" +
    "         <li><a href=\"https://github.com/impactstory\">open source</a></li>\n" +
    "         <li><a href=\"http://blog.impactstory.org/2012/06/08/24638498595/\">free and open data</a>, to the extent permitted by data providers</li>\n" +
    "         <li><a href=\"http://en.wikipedia.org/wiki/Radical_transparency\">Radical transparency</a> and <a href=\"http://blog.impactstory.org\">open communication</a></li>\n" +
    "      </ul>\n" +
    "\n" +
    "      <h3 id=\"board\">board of directors</h3>\n" +
    "\n" +
    "      <div class=\"board-member\">\n" +
    "         <img src=\"http://i.imgur.com/G4wUQb8.png\" height=100/>\n" +
    "         <p><strong>Heather Joseph</strong> is the Executive Director of the <a href=\"http://www.sparc.arl.org/\">Scholarly Publishing and Academic Resources Coalition (SPARC)</a> and the convener of the\n" +
    "            <a href=\"http://www.taxpayeraccess.org/\">Alliance for Taxpayer Access</a>. Prior to coming to SPARC, she spent 15 years as a publisher in both commercial and not-for-profit publishing organizations. She served as the publishing director at the American Society for Cell Biology, which became the first journal to commit its full content to the NIH’s pioneering open repository, PubMed Central.</p>\n" +
    "\n" +
    "         <p>Heather serves on the Board of Directors of numerous not-for-profit organizations, including the\n" +
    "            <a href=\"http://www.plos.org\">Public Library of Science</a>.  She is a frequent speaker and writer on scholarly communications in general, and on open access in particular.</p>\n" +
    "      </div>\n" +
    "\n" +
    "      <div class=\"board-member\">\n" +
    "         <img src=\"http://i.imgur.com/dVJPqlw.png\" height=100/>\n" +
    "         <p><strong>Ethan White</strong> is an Associate Professor and Moore Investigator in the Department of Wildlife Ecology and Conservation and the Informatics Institute at the University of Florida.\n" +
    "\n" +
    "\n" +
    "             He studies ecological systems using data-intensive approaches and is actively involved in open approaches to science. He has written papers on <a href=\"http://dx.doi.org/10.4033/iee.2013.6b.6.f\">data management and sharing</a>, <a href=\"http://dx.doi.org/10.1371/journal.pbio.1001745\">best practices in computational science</a>, and <a href=\"http://dx.doi.org/10.1371/journal.pbio.1001563\">the benefits of preprints in biology</a>.</p>\n" +
    "         <p>Ethan has a PhD in Biology from the University of New Mexico, was a National Science Foundation Postdoctoral Fellow in biological informatics, and is the recipient of a National Science Foundation CAREER 'Young Investigators' Award. He speaks frequently about data-intensive approaches to ecology, co-writes a <a href=\"http://jabberwocky.weecology.org\">blog on ecology, academia, and open science</a>, develops material and serves as an instructor for <a href=”http://software-carpentry.org/”>Software Carpentry</a>, and is active on Twitter(<a href=\"https://twitter.com/ethanwhite/\">@ethanwhite</a>).</p>\n" +
    "      </div>\n" +
    "\n" +
    "      <div class=\"board-member\">\n" +
    "         <img src=\"http://static.tumblr.com/2d33e55fcae6625ea29a0ea14e6b99df/5mlmvbq/O15n1w7ty/tumblr_static_headshot_informal.jpg\" height=100/>\n" +
    "         <p><strong>John Wilbanks</strong> works at <a href=\"http://www.sagebase.org/our-leadership/\">Sage Bionetworks</a>, which helps build <a href=\"http://www.sagebase.org/governance/\">tools and policies</a> that help <a href=\"http://www.sagebase.org/bridge/\">networks of people who have their health data</a> share it with <a href=\"http://synapse.sagebase.org\">networks of people who like to analyze health data</a>.\n" +
    "         </p>\n" +
    "         <p>Previously, John worked at Harvard’s <a href=\"http://cyber.law.harvard.edu\">Berkman Center for Internet &amp; Society</a>, the <a href=\"http://www.w3.org/2001/sw/\" title=\"Semantic Web - World Wide Web Consortium\" target=\"_self\">World Wide Web Consortium</a>, the <a href=\"http://en.wikipedia.org/wiki/Pete_Stark\" title='Fortney \"Pete\" Stark' target=\"_self\">US House of Representatives</a>, <a href=\"http://creativecommons.org\" title=\"Creative Commons\" target=\"_self\">Creative Commons</a>, and the <a href=\"http://kauffman.org\">Ewing Marion Kauffman Foundation</a>. John also serves on the board of the non-profit\n" +
    "            <a href=\"http://earthsciencefoundation.org/\">Foundation for Earth Science</a> and advisory boards for companies including <a href=\"http://www.boundlesslearning.com/\">Boundless Learning</a>,  <a href=\"http://www.crunchbase.com/company/curious-inc\">Curious</a>,  <a href=\"http://genomera.com\">Genomera</a>, <a href=\"http://www.qualcommlife.com/\">Qualcomm Life</a>, <a href=\"http://patientslikeme.com\">Patients Like Me</a>, and <a href=\"http://www.genospace.com/\">GenoSpace</a>.</p>\n" +
    "      </div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "      <div id=\"contact\">\n" +
    "         <h3>Contact</h3>\n" +
    "         <p>We'd love to hear your feedback, ideas, or just chat! Reach us at <a href=\"mailto:team@impactstory.org\">team@impactstory.org</a> or on <a href=\"http://twitter.com/Impactstory\">twitter</a>.\n" +
    "      </div>\n" +
    "\n" +
    "\n" +
    "   </div><!-- end wrapper -->\n" +
    "</div>");
}]);

angular.module("about-pages/sample.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("about-pages/sample.tpl.html",
    "<div class=\"page products-sample\">\n" +
    "    <h2>Here's a sample of {{ products.length }} articles</h2>\n" +
    "\n" +
    "    <div class=\"main\">\n" +
    "        <div class=\"product row\" ng-repeat=\"product in products\">\n" +
    "            <div class=\"id col-xs-2\">{{ product.id }}</div>\n" +
    "            <div class=\"link col-xs-10\">\n" +
    "                <a href=\"http://doi.org/{{ product.doi }}\">{{ product.title }}</a>\n" +
    "\n" +
    "            </div>\n" +
    "\n" +
    "        </div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("about-pages/search.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("about-pages/search.tpl.html",
    "<div class=\"page search\">\n" +
    "    <h2>Search for people</h2>\n" +
    "\n" +
    "    <div class=\"main\" ng-show=\"!loading\">\n" +
    "        <md-autocomplete\n" +
    "                md-selected-item=\"ctrl.selectedItem\"\n" +
    "                md-search-text=\"ctrl.searchText\"\n" +
    "                md-selected-item-change=\"onSearchSelect(person)\"\n" +
    "                md-items=\"person in search(ctrl.searchText)\"\n" +
    "                md-item-text=\"person.name\"\n" +
    "                md-min-length=\"3\"\n" +
    "                md-autofocus=\"true\">\n" +
    "\n" +
    "            <md-item-template>\n" +
    "                <span class=\"search-item\" md-highlight-text=\"ctrl.searchText\">{{person.name}}</span>\n" +
    "            </md-item-template>\n" +
    "\n" +
    "        </md-autocomplete>\n" +
    "        <p>\n" +
    "            You're searching against\n" +
    "            <span class=\"count\">{{ numProfiles }}</span>\n" +
    "            Impactstory profiles.\n" +
    "        </p>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("auth/login.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("auth/login.tpl.html",
    "<div class=\"page login-page\">\n" +
    "    <div class=\"login-container\">\n" +
    "        <h2>\n" +
    "            <a href=\"/\"><img src=\"static/img/impactstory-logo-sideways.png\" alt=\"\"></a>\n" +
    "        </h2>\n" +
    "        <div class=\"actions\">\n" +
    "            <div class=\"btn login-button twitter\"\n" +
    "                 ng-click=\"currentUser.twitterAuthenticate('login')\">\n" +
    "                <i class=\"fa fa-twitter\"></i>\n" +
    "                Log in with Twitter\n" +
    "            </div>\n" +
    "            <div class=\"btn login-button orcid\"\n" +
    "                 ng-click=\"currentUser.orcidAuthenticate('login', true)\">\n" +
    "                <img src=\"static/img/orcid-logo-white.png\" alt=\"\">\n" +
    "                Log in with ORCID\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"create-account\">\n" +
    "            Don't have an account?\n" +
    "            <a href=\"/\" ng-click=\"currentUser.twitterAuthenticate('register')\">Join for free</a>\n" +
    "            with Twitter.\n" +
    "        </div>\n" +
    "\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("auth/oauth.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("auth/oauth.tpl.html",
    "<div class=\"page oauth-page\">\n" +
    "\n" +
    "    <div class=\"focus-container\">\n" +
    "        <h2>\n" +
    "            <img src=\"static/img/impactstory-logo-sideways.png\" alt=\"\" ng-show=\"!error\">\n" +
    "        </h2>\n" +
    "        <div class=\"loading-container\" ng-show=\"!error\">\n" +
    "            <md-progress-linear md-mode=\"indeterminate\"></md-progress-linear>\n" +
    "        </div>\n" +
    "        <div class=\"working\" ng-show=\"!error\">\n" +
    "            <!--<i class=\"fa fa-refresh fa-spin\"></i>-->\n" +
    "\n" +
    "            Connecting with your\n" +
    "            <span class=\"identity-provider twitter\" ng-show=\"identityProvider=='twitter'\">\n" +
    "                Twitter\n" +
    "            </span>\n" +
    "            <span class=\"identity-provider orcid\" ng-show=\"identityProvider=='orcid'\">\n" +
    "                Orcid\n" +
    "            </span>\n" +
    "            &hellip;\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"error\" ng-show=\"error\">\n" +
    "\n" +
    "            <!-- ORCID error -->\n" +
    "            <div class=\"orcid\" ng-show=\"identityProvider=='orcid'\">\n" +
    "                <div class=\"msg\">\n" +
    "                    <div class=\"main\">\n" +
    "                        <i class=\"fa fa-exclamation-triangle\"></i>\n" +
    "                        Looks like you haven't created your Impactstory profile yet.\n" +
    "                        To create a profile, you'll need to sign in with\n" +
    "                        a Twitter account.\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"btn btn-default login-button twitter\"\n" +
    "                     ng-click=\"currentUser.twitterAuthenticate('register')\">\n" +
    "                    <i class=\"fa fa-twitter\"></i>\n" +
    "                    Create my profile using Twitter\n" +
    "                </div>\n" +
    "            </div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "            <!-- Twitter error -->\n" +
    "            <div class=\"twitter\" ng-show=\"identityProvider=='twitter'\">\n" +
    "                <div class=\"msg\">\n" +
    "                    <i class=\"fa fa-exclamation-triangle\"></i>\n" +
    "\n" +
    "                    Sorry, we don't recognize your Twitter account (@{{ identityProviderId }}).\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"buttons\">\n" +
    "                    <div class=\"btn login-button orcid\"\n" +
    "                        ng-click=\"currentUser.orcidAuthenticate('login', true)\">\n" +
    "                        <img src=\"static/img/orcid-logo-white.png\" alt=\"\">\n" +
    "                        Log in with ORCID instead\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"btn login-button twitter\"\n" +
    "                         ng-click=\"currentUser.twitterAuthenticate('register')\">\n" +
    "                        <i class=\"fa fa-twitter\"></i>\n" +
    "                        Create a new profile\n" +
    "                    </div>\n" +
    "\n" +
    "                </div>\n" +
    "            </div>\n" +
    "\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "</div>");
}]);

angular.module("auth/orcid-login.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("auth/orcid-login.tpl.html",
    "<h2>orcid is loading!</h2>");
}]);

angular.module("auth/twitter-login.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("auth/twitter-login.tpl.html",
    "<div class=\"login-loading main\">\n" +
    "  <div class=\"content\">\n" +
    "     <md-progress-circular class=\"md-primary\"\n" +
    "                           md-diameter=\"100\">\n" +
    "     </md-progress-circular>\n" +
    "     <h2>Getting your profile...</h2>\n" +
    "     <img src=\"static/img/impactstory-logo-sideways.png\">\n" +
    "  </div>\n" +
    "</div>");
}]);

angular.module("footer/footer.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("footer/footer.tpl.html",
    "<div id=\"footer\" ng-controller=\"footerCtrl\">\n" +
    "\n" +
    "\n" +
    "\n" +
    "    <div class=\"links\">\n" +
    "        <a href=\"/about\">\n" +
    "            <i class=\"fa fa-info-circle\"></i>\n" +
    "            About\n" +
    "        </a>\n" +
    "        <a href=\"https://github.com/Impactstory/depsy\">\n" +
    "            <i class=\"fa fa-github\"></i>\n" +
    "            GitHub\n" +
    "        </a>\n" +
    "        <a href=\"https://twitter.com/depsy_org\">\n" +
    "            <i class=\"fa fa-twitter\"></i>\n" +
    "            Twitter\n" +
    "        </a>\n" +
    "    </div>\n" +
    "\n" +
    "\n" +
    "    <div id=\"mc_embed_signup\">\n" +
    "        <form action=\"//impactstory.us4.list-manage.com/subscribe/post?u=26fcc4e14b24319755845d9e0&amp;id=c9dd1339cd\" method=\"post\" id=\"mc-embedded-subscribe-form\" name=\"mc-embedded-subscribe-form\" class=\"validate\" target=\"_blank\" novalidate>\n" +
    "\n" +
    "            <div id=\"mc_embed_signup_scroll\" class=\"input-group\">\n" +
    "                <input class=\"form-control text-input\" type=\"email\" value=\"\" name=\"EMAIL\" class=\"email\" id=\"mce-EMAIL\" placeholder=\"Join the mailing list\" required>\n" +
    "           <span class=\"input-group-btn\">\n" +
    "              <input class=\"btn btn-default\" type=\"submit\" value=\"Go\" name=\"subscribe\" id=\"mc-embedded-subscribe\" class=\"button\">\n" +
    "           </span>\n" +
    "\n" +
    "                <!-- real people should not fill this in and expect good things - do not remove this or risk form bot signups-->\n" +
    "                <div style=\"position: absolute; left: -5000px;\"><input type=\"text\" name=\"b_26fcc4e14b24319755845d9e0_c9dd1339cd\" tabindex=\"-1\" value=\"\"></div>\n" +
    "            </div>\n" +
    "        </form>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"built-by\">\n" +
    "        Built with <i class=\"fa fa-heart\"></i> at <a href=\"http://impactstory.org/about\">Impactstory</a>,\n" +
    "        <br>\n" +
    "        with support from the National Science Foundation\n" +
    "    </div>\n" +
    "\n" +
    "</div>");
}]);

angular.module("helps.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("helps.tpl.html",
    "\n" +
    "\n" +
    "\n" +
    "<p class=\"def buzz\" ng-show=\"subscoreName=='buzz'\">\n" +
    "    <strong>Buzz</strong> is the volume of discussion (good and bad)\n" +
    "    around your research, represented by\n" +
    "    the count of times your research is discussed online.\n" +
    "</p>\n" +
    "<p class=\"def influence\" ng-show=\"subscoreName=='influence'\">\n" +
    "    <strong>Influence</strong> is the average estimated <em>significance</em> of the sources\n" +
    "    discussing your research: Wikipedia counts for more than Facebook, and a tweeter\n" +
    "    with a million followers counts for more than one with a hundred.\n" +
    "</p>\n" +
    "<p class=\"def openness\" ng-show=\"subscoreName=='openness'\">\n" +
    "    <strong>Openness</strong> is how easy it is for people to actually read and use\n" +
    "    your research, estimated by the percent of your publications in\n" +
    "    <a href=\"https://en.wikipedia.org/wiki/Open_access#Journals:_gold_open_access\">Gold open-access</a>\n" +
    "    journals and repositories.\n" +
    "\n" +
    "</p>\n" +
    "<p class=\"def fun\" ng-show=\"subscoreName=='fun'\">\n" +
    "    <strong>Fun</strong> achievements are Not So Serious.\n" +
    "</p>");
}]);

angular.module("loading.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("loading.tpl.html",
    "<div id=\"loading\">\n" +
    "     <md-progress-circular class=\"md-primary\"\n" +
    "                           md-diameter=\"100px\">\n" +
    "     </md-progress-circular>\n" +
    "    <div class=\"message\">\n" +
    "        Loading your twitter\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("person-page/person-page-text.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("person-page/person-page-text.tpl.html",
    "<div class=\"person-page-text\">\n" +
    "    <h1>{{ person.given_names }} {{ person.family_name }}</h1>\n" +
    "\n" +
    "    <h2>Top achievements</h2>\n" +
    "    yay me!\n" +
    "</div>");
}]);

angular.module("person-page/person-page.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("person-page/person-page.tpl.html",
    "\n" +
    "\n" +
    "<div class=\"page person\">\n" +
    "    <div class=\"autogenerated\" ng-show=\"!person.d.claimed_at\">\n" +
    "        <span class=\"this-is\">\n" +
    "            This is an <a href=\"about/orcid\">auto-generated profile</a> and may be missing some data.\n" +
    "        </span>\n" +
    "        <span class=\"claim-this\">\n" +
    "            To update it,\n" +
    "            <a href=\"\" class=\"login\" ng-click=\"authenticate()\">log in with ORCID.</a>\n" +
    "        </span>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"person-header row\">\n" +
    "        <div class=\"col-md-9 person-about\">\n" +
    "            <div class=\"content\">\n" +
    "                <div class=\"avatar\">\n" +
    "                    <img ng-src=\"{{ person.d.picture }}\" alt=\"\"/>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"bio\">\n" +
    "                    <h2 class=\"name\">\n" +
    "                       {{ person.d.given_names }} {{ person.d.family_name }}\n" +
    "\n" +
    "                        <span class=\"accounts\">\n" +
    "                            <a href=\"http://orcid.org/{{ person.d.orcid_id }}\">\n" +
    "                                <img src=\"static/img/favicons/orcid.ico\" alt=\"\">\n" +
    "                            </a>\n" +
    "                            <a href=\"http://depsy.org/person/{{ person.d.depsy_id }}\"\n" +
    "                                    ng-show=\"person.d.depsy_id\">\n" +
    "                                <img src=\"static/img/favicons/depsy.png\" alt=\"\">\n" +
    "                            </a>\n" +
    "                            <a href=\"http://twitter.com/{{ person.d.twitter }}\"\n" +
    "                               ng-show=\"person.d.twitter\"\n" +
    "                               class=\"twitter\">\n" +
    "                                <img src=\"static/img/favicons/twitter.ico\" alt=\"\">\n" +
    "                            </a>\n" +
    "                        </span>\n" +
    "                    </h2>\n" +
    "                    <div class=\"aff\">\n" +
    "                        <span class=\"institution\">{{ person.d.affiliation_name }}</span>\n" +
    "                        <span class=\"role\">\n" +
    "                            {{ person.d.affiliation_role_title }}\n" +
    "                        </span>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"person-profile-info\">\n" +
    "                        <div class=\"open-access-info\">\n" +
    "                            <span class=\"fulltext\" ng-click=\"showAboutOaDialog($event)\">\n" +
    "                                <i class=\"fa fa-unlock-alt\"></i>\n" +
    "                                <span class=\"ti-label\">\n" +
    "                                    open access\n" +
    "                                </span>\n" +
    "                                <span class=\"val\">\n" +
    "                                    {{ numFormat.decimalToPerc(person.d.percent_fulltext) }}%</span></span>\n" +
    "                        </div>\n" +
    "                        <div class=\"open-access-actions\">\n" +
    "                            <a href=\"u/{{ person.d.orcid_id }}/a/open-hero\"\n" +
    "                               ng-show=\"person.d.percent_fulltext==1\"\n" +
    "                               class=\"is-open-hero\">\n" +
    "                                <i class=\"fa fa-star\"></i>\n" +
    "                                <span>Open Hero!</span>\n" +
    "                            </a>\n" +
    "                            <!--\n" +
    "                            <a href=\"https://twitter.com/intent/tweet?url={{ profileLinkToTweet }}&text=I've made {{ numFormat.decimalToPerc(person.d.percent_fulltext) }}%25 of my work free to read online. How about you%3F Find out your %23OAscore on @Impactstory.\"\n" +
    "                               target=\"_blank\"\n" +
    "                               class=\"share\"\n" +
    "                               ng-show=\"person.belongsToCurrentUser()\"\n" +
    "                               ng-click=\"shareBadge()\">\n" +
    "                                <span class=\"text\">Share your score</span>\n" +
    "                            </a>\n" +
    "                            -->\n" +
    "\n" +
    "\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "\n" +
    "        </div>\n" +
    "        <div class=\"col-md-3 person-actions\">\n" +
    "            <div class=\"tweet-profile\">\n" +
    "                <a href=\"https://twitter.com/intent/tweet?url=https://impactstory.org/u/{{ person.d.orcid_id }}&text=I learned about the online impact of my research on @Impactstory:\"\n" +
    "                   target=\"_blank\"\n" +
    "                   ng-click=\"shareProfile()\"\n" +
    "                   ng-show=\"person.belongsToCurrentUser()\"\n" +
    "                   class=\"btn btn-sm btn-default\">\n" +
    "                    <i class=\"fa fa-twitter\"></i>\n" +
    "                    <span class=\"text\">share</span>\n" +
    "                </a>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"no-products\" ng-show=\"!person.d.products.length\">\n" +
    "        <h2 class=\"main\">\n" +
    "            Looks we've got no publications for {{ person.d.first_name }}.\n" +
    "        </h2>\n" +
    "        <p>\n" +
    "            That's probably because {{ person.d.first_name }} hasn't associated any\n" +
    "            works with <a href=\"http://orcid.org/{{ person.d.orcid_id }}\">his or her ORCID profile.</a>\n" +
    "        </p>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"has-products\" ng-show=\"person.d.products.length\">\n" +
    "        <div class=\"tab-controls row tab-overview-{{ tab=='overview' }}\">\n" +
    "            <a class=\"tab overview selected-{{ tab=='overview' }}\" href=\"/u/{{ person.d.orcid_id }}\">overview</a>\n" +
    "            <a class=\"tab publications selected-{{ tab=='achievements' }}\" href=\"/u/{{ person.d.orcid_id }}/achievements\">achievements</a>\n" +
    "            <a class=\"tab publications selected-{{ tab=='timeline' }}\" href=\"/u/{{ person.d.orcid_id }}/timeline\">timeline</a>\n" +
    "            <a class=\"tab publications selected-{{ tab=='publications' }}\" href=\"/u/{{ person.d.orcid_id }}/publications\">publications</a>\n" +
    "        </div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "        <!-- OVERVIEW view -->\n" +
    "        <div class=\"tab-view overview row\" ng-if=\"tab=='overview'\">\n" +
    "            <div class=\"col-md-5\">\n" +
    "                <div class=\"badges widget\">\n" +
    "                    <div class=\"widget-header\">\n" +
    "                        <h3>Achievements</h3>\n" +
    "                        <a class=\"more\" href=\"/u/{{ person.d.orcid_id }}/achievements\">view all</a>\n" +
    "                    </div>\n" +
    "                    <div class=\"badges-wrapper\"\n" +
    "                         ng-include=\"'badge-item.tpl.html'\"\n" +
    "                         ng-repeat=\"badge in person.d.overview_badges | orderBy: '-sort_score' | limitTo: 3\">\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"col-md-7 big-col\">\n" +
    "                <div class=\"mentions timeline widget\">\n" +
    "                    <div class=\"widget-header\">\n" +
    "                        <h3>Timeline</h3>\n" +
    "                        <a class=\"more\" href=\"/u/{{ person.d.orcid_id }}/timeline\">view all</a>\n" +
    "                    </div>\n" +
    "                    <div class=\"channels\">\n" +
    "                        <span class=\"val total-posts\">{{ postsSum }}</span>\n" +
    "                        <span class=\"ti-label\">\n" +
    "                            Online mentions over {{ person.d.publishingAge }}\n" +
    "                            year<span ng-show=\"person.d.publishingAge\">s</span>\n" +
    "                        </span>\n" +
    "\n" +
    "                        <span class=\"channel\"\n" +
    "                              ng-class=\"{'more-than-3': $index > 3, 'more-than-8': $index > 8}\"\n" +
    "                              ng-repeat=\"channel in sources | orderBy: '-posts_count'\">\n" +
    "                            <img ng-src=\"/static/img/favicons/{{ channel.source_name }}.ico\"\n" +
    "                                 class=\"channel-icon {{ channel.source_name }}\">\n" +
    "                            <span class=\"val\">{{ numFormat.short(channel.posts_count) }}</span>\n" +
    "                        </span>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"publications widget\">\n" +
    "                    <div class=\"widget-header\">\n" +
    "                        <h3>Publications</h3>\n" +
    "                        <a class=\"more\" href=\"/u/{{ person.d.orcid_id }}/publications\">view all</a>\n" +
    "                    </div>\n" +
    "                    <div class=\"publication-wrapper\"\n" +
    "                         ng-include=\"'publication-item.tpl.html'\"\n" +
    "                         ng-repeat=\"product in products | orderBy: ['-num_mentions', '-is_oa_repository', '-is_oa_journal', 'doi'] | limitTo: 3\">\n" +
    "                    </div>\n" +
    "\n" +
    "                </div>\n" +
    "            </div>\n" +
    "\n" +
    "        </div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "        <!-- PUBLICATIONS view -->\n" +
    "        <div class=\"tab-view publications row\" ng-if=\"tab=='publications'\">\n" +
    "            <div class=\"col-md-8 publications-col main-col\">\n" +
    "                <h3>\n" +
    "                    <span class=\"count\">\n" +
    "                        {{ selectedGenre.count || products.length }}\n" +
    "                    </span>\n" +
    "                    <span class=\"most-recent\" ng-show=\"products.length==100\">\n" +
    "                        most recent\n" +
    "                    </span>\n" +
    "\n" +
    "                    <span class=\"no-filter\" ng-if=\"!selectedGenre\">\n" +
    "                        publication<span ng-show=\"products.length\">s</span>\n" +
    "                    </span>\n" +
    "\n" +
    "                    <span class=\"filter\" ng-if=\"selectedGenre\">\n" +
    "                        <span class=\"word\">published</span>\n" +
    "                        <span class=\"label label-default\">\n" +
    "                            <span class=\"content\">\n" +
    "                                <i class=\"fa fa-{{ getGenreIcon(selectedGenre.name) }}\"></i>\n" +
    "                                {{ pluralize(selectedGenre.display_name, selectedGenre.count) }}\n" +
    "                            </span>\n" +
    "                            <span class=\"close-button\" ng-click=\"toggleSeletedGenre(selectedGenre)\">&times;</span>\n" +
    "                        </span>\n" +
    "                    </span>\n" +
    "\n" +
    "                    <a href=\"wizard/add-publications\"\n" +
    "                       ng-show=\"person.belongsToCurrentUser() && products.length<100 && !selectedGenre\"\n" +
    "                       class=\"tool btn btn-default btn-sm\">\n" +
    "                        <i class=\"fa fa-plus\"></i>\n" +
    "                        Add publications\n" +
    "                    </a>\n" +
    "\n" +
    "\n" +
    "                </h3>\n" +
    "                <div class=\"publication-wrapper\"\n" +
    "                     ng-if=\"$index < d.viewItemsLimit\"\n" +
    "                     ng-include=\"'publication-item.tpl.html'\"\n" +
    "                     ng-repeat=\"product in products | orderBy: ['-num_mentions', '-is_oa_repository', '-is_oa_journal', 'doi'] | filter:{genre: selectedGenre.name}:true as filteredPublications\">\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"more\">\n" +
    "                    <span class=\"btn btn-default btn-sm\"\n" +
    "                          ng-click=\"d.viewItemsLimit = d.viewItemsLimit + 20\"\n" +
    "                          ng-show=\"d.viewItemsLimit < filteredPublications.length\">\n" +
    "                        <i class=\"fa fa-arrow-down\"></i>\n" +
    "                        See more\n" +
    "                    </span>\n" +
    "                </div>\n" +
    "\n" +
    "\n" +
    "            </div>\n" +
    "            <div class=\"col-md-4 badges-col small-col\">\n" +
    "\n" +
    "                <div class=\"filter-by-genre\" ng-show=\"genres.length > 1\">\n" +
    "                    <h4>Filter by genre</h4>\n" +
    "\n" +
    "                    <div class=\"genre-filter filter-option\"\n" +
    "                         ng-repeat=\"genre in genres\"\n" +
    "                         ng-class=\"{ unselected: selectedGenre && selectedGenre.name != genre.name, selected: selectedGenre.name == genre.name }\">\n" +
    "                        <span class=\"close-button\" ng-click=\"toggleSeletedGenre(genre)\">&times;</span>\n" +
    "                        <span class=\"content\" ng-click=\"toggleSeletedGenre(genre)\">\n" +
    "                            <span class=\"name\">\n" +
    "                                <i class=\"fa fa-{{ getGenreIcon(genre.name) }} icon\"></i>\n" +
    "                                {{ pluralize(genre.display_name, genre.count) }}\n" +
    "                            </span>\n" +
    "                            <span class=\"val\">({{ genre.count }})</span>\n" +
    "                        </span>\n" +
    "\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "                <div class=\"coauthors\" ng-show=\"person.d.coauthors.length\">\n" +
    "                    <h4>Coauthors</h4>\n" +
    "                    <div class=\"coauthor\" ng-repeat=\"coauthor in person.d.coauthors | orderBy: '-sort_score'\">\n" +
    "                        <span >\n" +
    "                            <a href=\"u/{{ coauthor.orcid_id }}\" class=\"name\">\n" +
    "                                {{ coauthor.name }}\n" +
    "                            </a>\n" +
    "                        </span>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "        <!-- BADGES view -->\n" +
    "        <div class=\"tab-view badges row\" ng-if=\"tab=='achievements'\">\n" +
    "            <div class=\"col-md-9 main-col\">\n" +
    "                <h3>\n" +
    "                    <span ng-show=\"filteredBadges.length\" class=\"amount\">{{ filteredBadges.length }}</span>\n" +
    "                    <span ng-show=\"!filteredBadges.length\" class=\"amount\">No</span>\n" +
    "                    achievement<span ng-hide=\"filteredBadges.length===1\">s</span>\n" +
    "                    <span ng-show=\"filteredBadges.length===0\" class=\"yet\">yet</span>\n" +
    "\n" +
    "                    <span class=\"filter\" ng-if=\"selectedSubscore\">\n" +
    "                        <span class=\"filter-intro\">in</span>\n" +
    "                        <span class=\"filter label label-default {{ selectedSubscore.name }}\">\n" +
    "                            <span class=\"content\">\n" +
    "                                <i class=\"icon fa fa-{{ getBadgeIcon(selectedSubscore.name) }}\"></i>\n" +
    "                                {{ selectedSubscore.display_name }}\n" +
    "                            </span>\n" +
    "                            <span class=\"close-button\" ng-click=\"toggleSeletedSubscore(selectedSubscore)\">&times;</span>\n" +
    "                        </span>\n" +
    "                    </span>\n" +
    "                </h3>\n" +
    "\n" +
    "                <div class=\"subscore-info\" ng-show=\"selectedSubscore\">\n" +
    "\n" +
    "\n" +
    "                    <!-- for all subscores -->\n" +
    "                    <div class=\"personalized\">\n" +
    "\n" +
    "\n" +
    "                        <span class=\"def buzz\" ng-show=\"selectedSubscore.name=='buzz'\">\n" +
    "                            <strong>Buzz</strong> is the volume of online discussion round your research.\n" +
    "                            It's a good (if coarse) measure of online interest around your work.\n" +
    "                        </span>\n" +
    "\n" +
    "                        <span class=\"def engagement\" ng-show=\"selectedSubscore.name=='engagement'\">\n" +
    "                            <strong>Engagement</strong> is about <em>how</em> people are interacting with your\n" +
    "                            research online. What's the quality of the discussion, who is having it, and where?\n" +
    "                        </span>\n" +
    "\n" +
    "\n" +
    "                        <span class=\"def openness\" ng-show=\"selectedSubscore.name=='openness'\">\n" +
    "                            <strong>Openness</strong> makes it easy for people to read and use\n" +
    "                            your research.\n" +
    "                        </span>\n" +
    "\n" +
    "                        <span class=\"def fun\" ng-show=\"selectedSubscore.name=='fun'\">\n" +
    "                            <strong>Fun</strong> achievements are Not So Serious.\n" +
    "                        </span>\n" +
    "\n" +
    "                        <span class=\"see-all-badges\">\n" +
    "                            You can see all the possible <span class=\"subscore-name\">{{ selectedSubscore.name }}</span>\n" +
    "                            achievements on their\n" +
    "                            <a class=\"{{ selectedSubscore.name }}\" href=\"/about/achievements#{{ selectedSubscore.name }}\">\n" +
    "                                help page.\n" +
    "                            </a>\n" +
    "                        </span>\n" +
    "\n" +
    "                        <div class=\"badges-count {{ selectedSubscore.name }}\">\n" +
    "\n" +
    "                            <!-- we've got some badges fro this subscore -->\n" +
    "                            <span class=\"some-badges\" ng-show=\"filteredBadges.length\">\n" +
    "                                You've earned {{ filteredBadges.length }} so far:\n" +
    "                            </span>\n" +
    "\n" +
    "                            <!-- no badges at all for this subscore-->\n" +
    "                            <span class=\"no-badges\" ng-show=\"!filteredBadges.length\">\n" +
    "                                <span class=\"subscore-badges\" ng-show=\"selectedSubscore.name!='fun'\">\n" +
    "                                    You haven't earned any yet&mdash;but if you keep doing great research and\n" +
    "                                    <a href=\"http://www.scidev.net/global/communication/practical-guide/altmetrics-audience-connect-research.html\">\n" +
    "                                        connecting it to a wide audience,\n" +
    "                                    </a>\n" +
    "                                    you will!\n" +
    "                                </span>\n" +
    "                                <span class=\"subscore-badges\" ng-show=\"selectedSubscore.name=='fun'\">\n" +
    "                                    You haven't earned any of them so far&mdash;but don't get us wrong, we know you are\n" +
    "                                    <a href=\"https://en.wikipedia.org/wiki/Happy_Fun_Ball\" class=\"fun\">super super fun.</a>\n" +
    "                                    Just, in ways our scholarly communication website cannot yet measure.\n" +
    "                                    Got an idea for a way we can fix that? Hit us up via\n" +
    "                                    <a href=\"http://twitter.com/impactstory\">Twitter</a> or\n" +
    "                                    <a href=\"mailto:team@impactstory.org\">email!</a>\n" +
    "                                </span>\n" +
    "                            </span>\n" +
    "\n" +
    "                        </div>\n" +
    "\n" +
    "\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div class=\"badges-wrapper\"\n" +
    "                     ng-class=\"\"\n" +
    "                     ng-include=\"'badge-item.tpl.html'\"\n" +
    "                     ng-repeat=\"badge in badges | orderBy: '-sort_score' | filter: {group: selectedSubscore.name}:true as filteredBadges\">\n" +
    "                </div>\n" +
    "            </div>\n" +
    "\n" +
    "            <!--\n" +
    "            <div class=\"col-md-4 small-col\">\n" +
    "                <h4>Filter by dimension</h4>\n" +
    "                <div class=\"subscore filter-option {{ subscore.name }}\"\n" +
    "                    ng-class=\"{ unselected: selectedSubscore && selectedSubscore.name != subscore.name, selected: selectedSubscore.name == subscore.name }\"\n" +
    "                    ng-click=\"toggleSeletedSubscore(subscore)\"\n" +
    "                    ng-repeat=\"subscore in subscores | orderBy: 'sortOrder'\">\n" +
    "\n" +
    "                    <span class=\"close-button\">&times;</span>\n" +
    "                    <span class=\"content\">\n" +
    "                        <span class=\"name\">\n" +
    "                            <i class=\"icon fa fa-{{ getBadgeIcon(subscore.name) }}\"></i>\n" +
    "                            {{ subscore.display_name }}\n" +
    "                        </span>\n" +
    "                        <span class=\"val\" ng-show=\"subscore.badgesCount\">({{ subscore.badgesCount }})</span>\n" +
    "                    </span>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            -->\n" +
    "        </div>\n" +
    "\n" +
    "\n" +
    "        <!-- MENTIONS view -->\n" +
    "        <div class=\"tab-view timeline row\" ng-if=\"tab=='timeline'\">\n" +
    "            <div class=\"col-md-8 posts-col main-col\">\n" +
    "                <h3>\n" +
    "                    {{ selectedChannel.posts_count || postsSum }}\n" +
    "                    <span class=\"ti-label\" ng-show=\"!selectedChannel\">\n" +
    "                        online mentions over {{ person.d.publishingAge }}\n" +
    "                            year<span ng-show=\"person.d.publishingAge\">s</span>\n" +
    "                    </span>\n" +
    "\n" +
    "\n" +
    "                    <span class=\"filter\" ng-if=\"selectedChannel\">\n" +
    "                        <span class=\"filter-intro\">mentions on</span>\n" +
    "                        <span class=\"filter label label-default\">\n" +
    "                            <span class=\"content\">\n" +
    "                                <img class=\"icon\" ng-src=\"/static/img/favicons/{{ selectedChannel.source_name }}.ico\">\n" +
    "                                {{ selectedChannel.source_name }}\n" +
    "                            </span>\n" +
    "                            <span class=\"close-button\" ng-click=\"toggleSelectedChannel(selectedChannel)\">&times;</span>\n" +
    "                        </span>\n" +
    "                    </span>\n" +
    "                </h3>\n" +
    "\n" +
    "                <!-- pseudo .view-item for mendeley so it can use same styles -->\n" +
    "                <!--\n" +
    "                <div class=\"rollup mendeley-rollup view-item\"\n" +
    "                     ng-controller=\"mendeleyRollupCtrl\"\n" +
    "                     ng-show=\"mendeleySource && (!selectedChannel || selectedChannel.source_name=='mendeley')\">\n" +
    "                    <div class=\"icon\">\n" +
    "                        <img ng-src=\"/static/img/favicons/mendeley.ico\">\n" +
    "                    </div>\n" +
    "                   <div class=\"content\">\n" +
    "                       <div class=\"title\" ng-click=\"d.showMendeleyDetails = !d.showMendeleyDetails\">\n" +
    "                           <i ng-show=\"d.showMendeleyDetails\" class=\"fa fa-minus-square show-hide\"></i>\n" +
    "                           <i ng-show=\"!d.showMendeleyDetails\" class=\"fa fa-plus-square show-hide\"></i>\n" +
    "                           {{ mendeleySource.posts_count }} Mendeley saves\n" +
    "                           <span class=\"extra\">click to\n" +
    "                                <span ng-show=\"d.showMendeleyDetails\">hide</span>\n" +
    "                                <span ng-show=\"!d.showMendeleyDetails\">show</span>\n" +
    "                           </span>\n" +
    "                       </div>\n" +
    "\n" +
    "                       <div class=\"under\">\n" +
    "                            <span class=\"date-and-attr\">\n" +
    "                                over the last\n" +
    "                                <span class=\"single\" ng-show=\"person.d.publishingAge > 1\">\n" +
    "                                    {{ person.d.publishingAge }} years\n" +
    "                                </span>\n" +
    "                                <span class=\"single\" ng-show=\"person.d.publishingAge <= 1\">\n" +
    "                                    year\n" +
    "                                </span>\n" +
    "\n" +
    "                                by <em>multiple readers</em>\n" +
    "                            </span>\n" +
    "                       </div>\n" +
    "\n" +
    "                       <div class=\"under mendeley-summary\" ng-show=\"d.showMendeleyDetails\">\n" +
    "                           <div class=\"disclaimer\">\n" +
    "                               Mendeley is a reference manager, like Endnote. For privacy reasons, they\n" +
    "                               conceal identifiable timeline and user information.\n" +
    "                               However, here's some summary information:\n" +
    "                           </div>\n" +
    "                           <div class=\"main row\">\n" +
    "                                <div class=\"col-md-6 col top-bookmarked\">\n" +
    "                                    <h5>Most saved <span class=\"extra\">(top 3)</span></h5>\n" +
    "                                    <div class=\"product\" ng-repeat=\"product in products | orderBy: '-mendeley.readers' | limitTo: 3\">\n" +
    "                                        <div class=\"title\">\n" +
    "                                            <i class=\"fa fa-{{ getGenreIcon(product.genre) }}\"></i>\n" +
    "                                            <a class=\"target\" href=\"u/{{ person.d.orcid_id }}/p/{{ product.id }}\">\n" +
    "                                                <short text=\"product.title\" len=\"80\"></short>\n" +
    "                                            </a>\n" +
    "                                        </div>\n" +
    "                                        <div class=\"bookmarks\">\n" +
    "                                            {{ product.mendeley.readers }} saves\n" +
    "                                        </div>\n" +
    "                                    </div>\n" +
    "\n" +
    "\n" +
    "                                </div>\n" +
    "                                <div class=\"col-md-3 col top-countries\">\n" +
    "                                    <h5>By country <span class=\"extra\">(top 5)</span></h5>\n" +
    "                                    <table>\n" +
    "                                        <tr ng-repeat=\"country in mendeleyCountries | orderBy: '-percent' | limitTo:5\">\n" +
    "                                            <td class=\"name\">{{ country.name }}</td>\n" +
    "                                            <td class=\"percent\">\n" +
    "                                                {{ numFormat.decimalToPerc(country.percent) }}<span class=\"percent-sign\">%</span>\n" +
    "                                            </td>\n" +
    "                                        </tr>\n" +
    "                                    </table>\n" +
    "                                </div>\n" +
    "                                <div class=\"col-md-3 col top-discipline\">\n" +
    "                                    <h5>By field <span class=\"extra\">(top 5)</span></h5>\n" +
    "                                    <table>\n" +
    "                                        <tr ng-repeat=\"discipline in mendeleyDisciplines | orderBy: '-percent' | limitTo:5\">\n" +
    "                                            <td class=\"name\">{{ discipline.name }}</td>\n" +
    "                                            <td class=\"percent\">\n" +
    "                                                {{ numFormat.decimalToPerc(discipline.percent) }}<span class=\"percent-sign\">%</span>\n" +
    "                                            </td>\n" +
    "                                        </tr>\n" +
    "                                    </table>\n" +
    "                                </div>\n" +
    "                           </div>\n" +
    "                       </div>\n" +
    "                   </div>\n" +
    "                </div>\n" +
    "                -->\n" +
    "\n" +
    "\n" +
    "                <div class=\"posts-wrapper\"\n" +
    "                     ng-repeat=\"post in posts | orderBy: '-posted_on' | filter: postsFilter as filteredPosts\">\n" +
    "\n" +
    "                    <div class=\"post normal\"\n" +
    "                         ng-if=\"$index < d.viewItemsLimit && !(!selectedChannel && post.source=='twitter')\"\n" +
    "                         ng-include=\"'mention-item.tpl.html'\"></div>\n" +
    "\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"more\">\n" +
    "                    <span class=\"btn btn-default btn-sm\"\n" +
    "                          ng-click=\"d.viewItemsLimit = d.viewItemsLimit + 20\"\n" +
    "                          ng-show=\"d.viewItemsLimit < filteredPosts.length\">\n" +
    "                        <i class=\"fa fa-arrow-down\"></i>\n" +
    "                        See more\n" +
    "                    </span>\n" +
    "                </div>\n" +
    "\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"col-md-4 score-col small-col\">\n" +
    "                <h4>Filter by channel</h4>\n" +
    "                <div class=\"channel filter-option {{ channel.source_name }}\"\n" +
    "                    ng-class=\"{selected: selectedChannel.source_name==channel.source_name, unselected: selectedChannel && selectedChannel.source_name != channel.source_name}\"\n" +
    "                    ng-click=\"toggleSelectedChannel(channel)\"\n" +
    "                    ng-repeat=\"channel in sources | orderBy: '-posts_count'\">\n" +
    "\n" +
    "                    <span class=\"close-button\">&times;</span>\n" +
    "                    <span class=\"content\">\n" +
    "                        <span class=\"name\">\n" +
    "                            <img ng-src=\"/static/img/favicons/{{ channel.source_name }}.ico\">\n" +
    "                            {{ channel.display_name }}\n" +
    "                        </span>\n" +
    "                        <span class=\"val\" ng-class=\"{'has-new': channel.events_last_week_count}\">\n" +
    "                            <md-tooltip ng-if=\"channel.events_last_week_count\">\n" +
    "                                {{ channel.events_last_week_count }} new enagements this week\n" +
    "                            </md-tooltip>\n" +
    "                            ({{ numFormat.short(channel.posts_count) }}\n" +
    "                            <span class=\"new-last-week\"\n" +
    "                                  ng-show=\"channel.events_last_week_count\">\n" +
    "                                <i class=\"fa fa-arrow-up\"></i>\n" +
    "                            </span>)\n" +
    "                        </span>\n" +
    "                    </span>\n" +
    "\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "        <div class=\"row person-footer\">\n" +
    "            <div class=\"text col-md-8\">\n" +
    "                <span class=\"text\">\n" +
    "                    <span class=\"secret-sync\" ng-click=\"refreshFromSecretButton()\">\n" +
    "                        <i class=\"fa fa-unlock\"></i>\n" +
    "                    </span>\n" +
    "                    All the data you see here is open for re-use.\n" +
    "                </span>\n" +
    "            </div>\n" +
    "            <div class=\"buttons col-md-4\">\n" +
    "                <a class=\"btn btn-xs btn-default\"\n" +
    "                   target=\"_self\"\n" +
    "                   href=\"/api/person/{{ person.d.orcid_id }}\">\n" +
    "                    <i class=\"fa fa-cogs\"></i>\n" +
    "                    view as JSON\n" +
    "                </a>\n" +
    "            </div>\n" +
    "\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"badgeDialog.tpl.html\">\n" +
    "    <md-dialog id=\"badgeDialog\">\n" +
    "        <md-dialog-content>\n" +
    "            <h2>Check it out! {{ firstName }} unlocked this nifty achievement:</h2>\n" +
    "            <div class=\"badge-container\" ng-include=\"'badge-item.tpl.html'\"></div>\n" +
    "            <div class=\"video-container\" ng-show=\"badge.name=='big_in_japan'\">\n" +
    "                <iframe class=\"big-in-japan video youtube\"\n" +
    "                        src=\"https://www.youtube.com/embed/tl6u2NASUzU\"\n" +
    "                        frameborder=\"0\">\n" +
    "\n" +
    "                </iframe>\n" +
    "            </div>\n" +
    "        </md-dialog-content>\n" +
    "        <md-dialog-actions class=\"dialog-actions\">\n" +
    "            <a href=\"https://twitter.com/intent/tweet?url=https://impactstory.org{{ badgeUrl }}&text=I unlocked the '{{ badge.display_name }}' achievement on @Impactstory:\"\n" +
    "               target=\"_blank\"\n" +
    "               class=\"btn btn-default\"\n" +
    "               ng-click=\"shareBadge()\">\n" +
    "                <i class=\"fa fa-twitter\"></i>\n" +
    "                <span class=\"text\">Share</span>\n" +
    "            </a>\n" +
    "            <span ng-click=\"cancel()\" class=\"btn btn-default\">\n" +
    "                <i class=\"fa fa-times\"></i>\n" +
    "                <span class=\"text\">Dismiss</span>\n" +
    "            </span>\n" +
    "        </md-dialog-actions>\n" +
    "    </md-dialog>\n" +
    "</script>\n" +
    "\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"aboutOaDialog.tpl.html\">\n" +
    "    <md-dialog id=\"aboutOaDialog\">\n" +
    "        <md-dialog-content>\n" +
    "            <div class=\"md-dialog-content\">\n" +
    "                <h2 class=\"main\"><i class=\"fa fa-unlock-alt\"></i> How open are you?</h2>\n" +
    "\n" +
    "                <p>\n" +
    "                    We've found <strong>{{ numFormat.decimalToPerc(person.d.percent_fulltext) }}%</strong> of your publications\n" +
    "                    freely available online. That's great! Research shows that openly-available papers\n" +
    "                    are more likely to be <a href=\"http://sparceurope.org/oaca/\">cited,</a>\n" +
    "                    <a href=\"http://microblogging.infodocs.eu/wp-content/uploads/2015/12/openScience_oct2015_ver2.pdf\">read,</a>\n" +
    "                    and <a href=\"https://www.altmetric.com/blog/attentionoa/\">discussed online</a> more than toll-access ones.\n" +
    "                </p>\n" +
    "\n" +
    "                <p>\n" +
    "                    To boost your score, just upload some of your articles to an open access\n" +
    "                    repository and recalculate:\n" +
    "                    <a href=\"/about/data#boost-your-oa-score\">here's how.</a>\n" +
    "                </p>\n" +
    "                <p>\n" +
    "                    To learn more about Open Access and the importance of open licenses, check out <a\n" +
    "                        href=\"http://sparcopen.org/our-work/howopenisit/\">HowOpenIsIt.</a>\n" +
    "                </p>\n" +
    "\n" +
    "            </div>\n" +
    "\n" +
    "        </md-dialog-content>\n" +
    "        <md-dialog-actions class=\"dialog-actions\">\n" +
    "            <span ng-click=\"cancel()\" class=\"btn btn-default\">\n" +
    "                <i class=\"fa fa-times\"></i>\n" +
    "                <span class=\"text\">Dismiss</span>\n" +
    "            </span>\n" +
    "            <a href=\"https://twitter.com/intent/tweet?url={{ profileLinkToTweet }}&text=I've made {{ numFormat.decimalToPerc(person.d.percent_fulltext) }}%25 of my work free to read online. How about you%3F Find out your %23OAscore on @Impactstory.\"\n" +
    "               target=\"_blank\"\n" +
    "               class=\"btn btn-primary\"\n" +
    "               ng-click=\"shareBadge()\">\n" +
    "                <i class=\"fa fa-twitter\"></i>\n" +
    "                <span class=\"text\">Share your score</span>\n" +
    "            </a>\n" +
    "        </md-dialog-actions>\n" +
    "\n" +
    "    </md-dialog>\n" +
    "</script>\n" +
    "");
}]);

angular.module("product-page/product-page.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("product-page/product-page.tpl.html",
    "<div class=\"page product-page\">\n" +
    "    <div class=\"row biblio-row\">\n" +
    "        <div class=\"biblio-col col-md-8\">\n" +
    "            <a href=\"/u/{{ person.d.orcid_id }}/publications\" class=\"back-to-profile\">\n" +
    "                <i class=\"fa fa-chevron-left\"></i>\n" +
    "                Back to {{ person.d.first_name }}'s publications\n" +
    "            </a>\n" +
    "            <div class=\"genre\" ng-show=\"product.genre != 'article' && product.genre != 'other'\">\n" +
    "                <i class=\"fa fa-{{ getGenreIcon(product.genre) }}\"></i>\n" +
    "                {{ product.genre.replace(\"-\", \" \") }}\n" +
    "            </div>\n" +
    "            <h2 class=\"title\">\n" +
    "                {{ product.title }}\n" +
    "            </h2>\n" +
    "            <div class=\"authors\">\n" +
    "                {{product.authors}}\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"journal\">\n" +
    "                <span class=\"year\">{{product.year}}</span>\n" +
    "                <a href=\"http://doi.org/{{ product.doi }}\"\n" +
    "                   ng-show=\"product.doi\"\n" +
    "                   class=\"journal\">\n" +
    "                    {{product.journal}}\n" +
    "                    <i class=\"fa fa-external-link\"></i>\n" +
    "                </a>\n" +
    "                <a href=\"{{ product.url }}\"\n" +
    "                   ng-show=\"product.url && !product.doi\"\n" +
    "                   class=\"journal\">\n" +
    "                    {{product.journal}}\n" +
    "                    <i class=\"fa fa-external-link\"></i>\n" +
    "                </a>\n" +
    "                <span ng-show=\"!product.url && !product.doi\"\n" +
    "                   class=\"journal\">\n" +
    "                    {{product.journal}}\n" +
    "                </span>\n" +
    "\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"fulltext\" ng-show=\"product.fulltext_url\">\n" +
    "                <a href=\"{{ product.fulltext_url }}\">\n" +
    "                    <i class=\"fa fa-unlock-alt\"></i>\n" +
    "                    Free fulltext available\n" +
    "                    <i class=\"fa fa-external-link\"></i>\n" +
    "                </a>\n" +
    "            </div>\n" +
    "            <div class=\"no-fulltext\" ng-show=\"!product.fulltext_url && person.belongsToCurrentUser()\">\n" +
    "                <div class=\"btn btn-default\" ng-click=\"setFulltextUrl($event)\">\n" +
    "                    <i class=\"fa fa-link\"></i>\n" +
    "                    Add a link to free fulltext\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"row main-row\">\n" +
    "        <div class=\"col-md-12 no-posts\" ng-show=\"!postsSum && product.doi\">\n" +
    "            <p>We haven't found any online discussion around this publication yet.</p>\n" +
    "        </div>\n" +
    "        <div class=\"col-md-12 no-doi\" ng-show=\"!product.doi\">\n" +
    "            <div class=\"icon\">\n" +
    "                <i class=\"fa fa-adjust\"></i>\n" +
    "            </div>\n" +
    "            <div class=\"content\">\n" +
    "                <p>\n" +
    "                    <strong>Missing data:</strong> we don't have a <abbr title=\"Document Object Identifier\">DOI</abbr> for this publication. Without\n" +
    "                    <a href=\"https://en.wikipedia.org/wiki/Digital_object_identifier\">\n" +
    "                        this standard unique identifier,\n" +
    "                    </a>\n" +
    "                    it's harder to track online conversations about the work.\n" +
    "                </p>\n" +
    "                <p>\n" +
    "                    If you've\n" +
    "                    got a DOI for this publication we don't know about, you can add\n" +
    "                    it in <a href=\"http://orcid.org/{{ person.d.orcid_id }}\" target=\"_blank\">your ORCID</a>\n" +
    "                    and then re-sync.\n" +
    "                </p>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <!-- MENTIONS view. copied from the profile page -->\n" +
    "        <div class=\"tab-view mentions row\" ng-show=\"postsSum\">\n" +
    "            <div class=\"col-md-8 posts-col main-col\">\n" +
    "                <h3>\n" +
    "                    <span class=\"ti-label\" ng-show=\"!selectedChannel\">saved and shared</span>\n" +
    "                    <span class=\"ti-label\" ng-show=\"selectedChannel && selectedChannel.source_name != 'mendeley'\">shared</span>\n" +
    "                    <span class=\"ti-label\" ng-show=\"selectedChannel.source_name=='mendeley'\">saved</span>\n" +
    "                    {{ selectedChannel.posts_count || postsSum }} times\n" +
    "\n" +
    "                    <span class=\"filter\" ng-if=\"selectedChannel\">\n" +
    "                        <span class=\"filter-intro\">on</span>\n" +
    "                        <span class=\"filter label label-default\">\n" +
    "                            <span class=\"content\">\n" +
    "                                <img class=\"icon\" ng-src=\"/static/img/favicons/{{ selectedChannel.source_name }}.ico\">\n" +
    "                                {{ selectedChannel.source_name }}\n" +
    "                            </span>\n" +
    "                            <span class=\"close-button\" ng-click=\"toggleSelectedChannel(selectedChannel)\">&times;</span>\n" +
    "                        </span>\n" +
    "                    </span>\n" +
    "                </h3>\n" +
    "\n" +
    "\n" +
    "                <!-- pseudo .view-item for mendeley so it can use same styles\n" +
    "                this is partly copied from the person page, but is a lighter version that\n" +
    "                links users to mendeley page for this product.\n" +
    "                 -->\n" +
    "                <div class=\"rollup mendeley-rollup view-item\"\n" +
    "                     ng-controller=\"mendeleyRollupCtrl\"\n" +
    "                     ng-show=\"mendeleySource && (!selectedChannel || selectedChannel.source_name=='mendeley')\">\n" +
    "                    <div class=\"icon\">\n" +
    "                        <img ng-src=\"/static/img/favicons/mendeley.ico\">\n" +
    "                    </div>\n" +
    "                   <div class=\"content\">\n" +
    "                       <div class=\"title\">\n" +
    "                           {{ mendeleySource.posts_count }} Mendeley saves\n" +
    "                       </div>\n" +
    "\n" +
    "                       <div class=\"under\">\n" +
    "                            <span class=\"date-and-attr\">\n" +
    "                                since this article's publication in {{ product.year }}\n" +
    "                            </span>\n" +
    "                       </div>\n" +
    "\n" +
    "                       <div class=\"under mendeley-summary\">\n" +
    "                           <div class=\"disclaimer perma-show\">\n" +
    "                               Mendeley is a reference manager, like Endnote. For privacy reasons, they\n" +
    "                               conceal identifiable timeline and user information.\n" +
    "                               Some summary info is available on\n" +
    "                               <a href=\"{{ product.mendeley.mendeley_url }}\" target=\"_blank\">\n" +
    "                                   Mendeley's website\n" +
    "                                   <i class=\"fa fa-external-link\"></i>\n" +
    "                               </a>\n" +
    "                           </div>\n" +
    "                       </div>\n" +
    "                   </div>\n" +
    "                </div>\n" +
    "\n" +
    "\n" +
    "                <div class=\"posts-wrapper\"\n" +
    "                     ng-repeat=\"post in posts | orderBy: '-posted_on' | filter: postsFilter as filteredPosts\">\n" +
    "\n" +
    "                    <div class=\"post normal\"\n" +
    "                         ng-if=\"$index < d.postsLimit && !(!selectedChannel && post.source=='twitter')\"\n" +
    "                         ng-include=\"'mention-item.tpl.html'\"></div>\n" +
    "\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"more\">\n" +
    "                    <span class=\"btn btn-default btn-sm\"\n" +
    "                          ng-click=\"d.postsLimit = d.postsLimit + 10\"\n" +
    "                          ng-show=\"d.postsLimit < filteredPosts.length\">\n" +
    "                        <i class=\"fa fa-arrow-down\"></i>\n" +
    "                        See more\n" +
    "                    </span>\n" +
    "                </div>\n" +
    "\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"col-md-4 score-col small-col\">\n" +
    "                <h4>Filter by activity</h4>\n" +
    "                <div class=\"channel filter-option {{ channel.source_name }}\"\n" +
    "                    ng-class=\"{selected: selectedChannel.source_name==channel.source_name, unselected: selectedChannel && selectedChannel.source_name != channel.source_name}\"\n" +
    "                    ng-click=\"toggleSelectedChannel(channel)\"\n" +
    "                    ng-repeat=\"channel in sources | orderBy: '-posts_count'\">\n" +
    "\n" +
    "                    <span class=\"close-button\">&times;</span>\n" +
    "                    <span class=\"content\">\n" +
    "                        <span class=\"name\">\n" +
    "                            <img ng-src=\"/static/img/favicons/{{ channel.source_name }}.ico\">\n" +
    "                            {{ channel.display_name }}\n" +
    "                        </span>\n" +
    "                        <span class=\"val\" ng-class=\"{'has-new': channel.events_last_week_count}\">\n" +
    "                            <md-tooltip ng-if=\"channel.events_last_week_count\">\n" +
    "                                {{ channel.events_last_week_count }} new engagments this week\n" +
    "                            </md-tooltip>\n" +
    "                            ({{ numFormat.short(channel.posts_count) }}\n" +
    "                            <span class=\"new-last-week\"\n" +
    "                                  ng-show=\"channel.events_last_week_count\">\n" +
    "                                <i class=\"fa fa-arrow-up\"></i>\n" +
    "                            </span>)\n" +
    "                        </span>\n" +
    "                    </span>\n" +
    "\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("settings-page/settings-page.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("settings-page/settings-page.tpl.html",
    "<div class=\"page settings-page\">\n" +
    "    <h2>Settings</h2>\n" +
    "    <a href=\"/u/{{ orcidId }}\" class=\"back-to-profile\">\n" +
    "        <i class=\"fa fa-chevron-left\"></i>\n" +
    "        Back to my profile\n" +
    "\n" +
    "    </a>\n" +
    "\n" +
    "    <!-- launching for the DORA anniversary in December :) -->\n" +
    "    <div class=\"setting-panel\" ng-hide=\"true\">\n" +
    "        <h3>DORAfy <span><i class=\"fa fa-unlock-alt\"></i> OAWeek only!</span></h3>\n" +
    "        <p>\n" +
    "            <a href=\"https://en.wikipedia.org/wiki/San_Francisco_Declaration_on_Research_Assessment/\">\n" +
    "            The San Francisco Declaration on Research Assessment (DORA)\n" +
    "            </a>\n" +
    "             intends to halt the practice of correlating the journal impact factor to the merits \n" +
    "            of a specific scientist's contributions: \n" +
    "        </p>\n" +
    "        <blockquote>\n" +
    "            Do not use journal-based metrics, such as Journal Impact Factors, as a surrogate measure\n" +
    "            of the quality of individual research articles, to assess an individual scientist’s\n" +
    "            contributions, or in hiring, promotion, or funding decisions.\n" +
    "        </blockquote>\n" +
    "        <p>\n" +
    "            We love this idea. And in fact, we're signatories of DORA. The declaration is\n" +
    "            celebrating it's fourth anniversary this week.\n" +
    "        </p>\n" +
    "        <p>\n" +
    "            So, for this week, you can \"DORAfy\" your profile by hiding all the journals you've published in\n" +
    "            (they'll come back after the 16th).\n" +
    "\n" +
    "            {{ currentUser.profileLink() }}\n" +
    "        </p>\n" +
    "        <div class=\"dorafy-controls\">\n" +
    "            <div class=\"dora-state waiting\" ng-show=\"dorafied===false\">\n" +
    "                <span class=\"btn btn-lg btn-default\"\n" +
    "                      ng-click=\"setDorafy(true)\">\n" +
    "                    <i class=\"fa fa-check\"></i>\n" +
    "                    DORAfy me!\n" +
    "                </span>\n" +
    "            </div>\n" +
    "            <div class=\"dora-state working\" ng-show=\"dorafied===null\">\n" +
    "                <div class=\"loading-container\" ng-show=\"!error\">\n" +
    "                    <md-progress-linear md-mode=\"indeterminate\"></md-progress-linear>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div class=\"dora-state done\" ng-show=\"dorafied===true\">\n" +
    "                <div class=\"success\">\n" +
    "                    <span class=\"text\">You're DORAfied!</span>\n" +
    "                    <a href=\"https://twitter.com/intent/tweet?url={{ currentUser.profileLink() }}&text=I DORAfied my @Impactstory profile to show my support for the @DORAssessment declaration! http://www.ascb.org/dora\"\n" +
    "                       target=\"_blank\"\n" +
    "                       class=\"btn btn-default\">\n" +
    "                        <i class=\"fa fa-twitter\"></i>\n" +
    "                        <span class=\"text\">Share</span>\n" +
    "                    </a>\n" +
    "                </div>\n" +
    "                <a class=\"undo\" href=\"\" ng-click=\"setDorafy(false)\">\n" +
    "                    undo\n" +
    "                </a>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"setting-panel\">\n" +
    "        <h3>Sync data from ORCID</h3>\n" +
    "        <p>\n" +
    "            Your Impactstory profile is built on your ORCID profile, and it\n" +
    "            automatically stays in sync to pull in your new information and new works.\n" +
    "            But if you can't wait, you can also sync manually right now.\n" +
    "        </p>\n" +
    "        <div class=\"sync-controls\">\n" +
    "            <span class=\"btn btn-lg btn-default\"\n" +
    "                  ng-show=\"syncState=='ready'\"\n" +
    "                  ng-click=\"pullFromOrcid()\">\n" +
    "                <i class=\"fa fa-refresh\"></i>\n" +
    "                Sync with my ORCID now\n" +
    "            </span>\n" +
    "            <div class=\"alert alert-info\" ng-show=\"syncState=='working'\">\n" +
    "                <i class=\"fa fa-refresh fa-spin\"></i>\n" +
    "                Syncing now...\n" +
    "            </div>\n" +
    "            <div class=\"alert alert-success\" ng-show=\"syncState=='success'\">\n" +
    "                <i class=\"fa fa-check\"></i>\n" +
    "                Sync complete!\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"setting-panel twitter\">\n" +
    "        <div class=\"disconnect\" ng-show=\"currentUser.d.twitter_screen_name\">\n" +
    "            <h3>Disconnect your Twitter</h3>\n" +
    "            <p>\n" +
    "                This is handy if you want to associate a different Twitter account with your\n" +
    "                Impactstory profile.\n" +
    "            </p>\n" +
    "            <div class=\"button\">\n" +
    "                <span class=\"btn btn-lg btn-default\"\n" +
    "                      ng-click=\"currentUser.disconnectTwitter()\">\n" +
    "                    <i class=\"fa fa-twitter\"></i>\n" +
    "                    Disconnect from @{{ currentUser.d.twitter_screen_name }}\n" +
    "                </span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"connect\" ng-show=\"!currentUser.d.twitter_screen_name\">\n" +
    "            <h3>Connect to your Twitter</h3>\n" +
    "            <p>\n" +
    "                This will set your profile picture and add a link to your Twitter account.\n" +
    "            </p>\n" +
    "            <div class=\"button\">\n" +
    "                <span class=\"btn btn-lg btn-default\"\n" +
    "                      ng-click=\"currentUser.twitterAuthenticate('connect')\">\n" +
    "                    <i class=\"fa fa-twitter\"></i>\n" +
    "                    Connect to your Twitter\n" +
    "                </span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"setting-panel\">\n" +
    "        <h3>Donate</h3>\n" +
    "        <p>\n" +
    "            Impactstory is a nonprofit, and the application you're\n" +
    "            using is free. But if you're getting value out of it,\n" +
    "            we'd love a donation to help keep us around.\n" +
    "        </p>\n" +
    "        <span class=\"btn btn-lg btn-default\" ng-click=\"donate(1000)\">\n" +
    "            <i class=\"fa fa-thumbs-o-up\"></i>\n" +
    "                Donate $10\n" +
    "            </span>\n" +
    "        <span class=\"btn btn-lg btn-default\" ng-click=\"donate(10000)\">\n" +
    "            <i class=\"fa fa-thumbs-o-up\"></i>\n" +
    "            Donate $100\n" +
    "        </span>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"setting-panel\">\n" +
    "        <h3>Delete</h3>\n" +
    "        <p>\n" +
    "            Don't like what you see? Drop us a line, we'd love to hear how\n" +
    "            Impactstory could be better. Or you can just delete this profile:\n" +
    "        </p>\n" +
    "        <div class=\"first-q\">\n" +
    "            <span ng-click=\"wantToDelete=true\"\n" +
    "                  ng-show=\"!wantToDelete\"\n" +
    "                  class=\"btn btn-lg btn-default\">\n" +
    "                <i class=\"fa fa-trash\"></i>\n" +
    "                Delete my Impactstory profile\n" +
    "            </span>\n" +
    "        </div>\n" +
    "        <div class=\"second-q\" ng-show=\"wantToDelete\">\n" +
    "            <h4>Are you sure you want to delete your profile?</h4>\n" +
    "            <span ng-click=\"deleteProfile()\"\n" +
    "                  class=\"btn btn-lg btn-danger\">Yes I'm sure!</span>\n" +
    "\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("sidemenu.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("sidemenu.tpl.html",
    "<div class=\"menu-items\">\n" +
    "    <div class=\"source last-real-source-{{ $last }} first-real-source-{{ $first }}\"\n" +
    "         ng-class=\"{viewThisSource==source.source_name}\"\n" +
    "         ng-click=\"setWorkspace('posts', source.source_name)\"\n" +
    "         ng-repeat=\"source in sources | orderBy: '-posts_count'\">\n" +
    "        <span class=\"favicon\">\n" +
    "            <img ng-src=\"/static/img/favicons/{{ source.source_name }}.ico\">\n" +
    "        </span>\n" +
    "        <span class=\"name\">{{ source.display_name }}</span>\n" +
    "        <span class=\"icon-right\">\n" +
    "            <span class=\"new-last-week\"\n" +
    "                  tooltip=\"{{ source.events_last_week_count }} new this week\"\n" +
    "                  ng-show=\"source.events_last_week_count\">\n" +
    "                <i class=\"fa fa-arrow-up\"></i>\n" +
    "            </span>\n" +
    "            <span class=\"look-right\" ng-show=\"workspace=='posts' && viewThisSource==source.source_name\">\n" +
    "                <i class=\"fa fa-chevron-right\"></i>\n" +
    "            </span>\n" +
    "        </span>\n" +
    "        <span class=\"value\">\n" +
    "            {{ numFormat.short(source.posts_count) }}\n" +
    "        </span>\n" +
    "    </div>\n" +
    "</div>\n" +
    "<a class=\"learn-more\" href=\"about/metrics\">\n" +
    "    <i class=\"fa fa-info-circle\"></i>\n" +
    "    <span class=\"text\">Learn more about metrics</span>\n" +
    "</a>");
}]);

angular.module("static-pages/landing.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("static-pages/landing.tpl.html",
    "<!-- the landing page for people who are not logged in -->\n" +
    "<div class=\"landing static-page\">\n" +
    "    <div class=\"above-the-fold\">\n" +
    "        <div class=\"tagline\">\n" +
    "            <h1>\n" +
    "                Discover the online impact of your research.\n" +
    "            </h1>\n" +
    "            <div class=\"sub\">\n" +
    "                Track buzz on Twitter, blogs, news outlets and more:\n" +
    "                we're like Google Scholar for your research's online reach.\n" +
    "                Making a profile takes just seconds:\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"join-button\">\n" +
    "            <md-button class=\"md-accent md-raised\" ng-click=\"currentUser.twitterAuthenticate('register')\">\n" +
    "                <i class=\"fa fa-twitter\"></i>\n" +
    "                Join for free with Twitter\n" +
    "            </md-button>\n" +
    "            <div class=\"sample\">\n" +
    "                <a href=\"u/0000-0001-6728-7745\">\n" +
    "                    <i class=\"fa fa-search\"></i>\n" +
    "                    See an example profile\n" +
    "                </a>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"featured-in\">\n" +
    "        <h4>\n" +
    "            Featured in\n" +
    "            <i class=\"fa fa-chevron-down\"></i>\n" +
    "        </h4>\n" +
    "        <div class=\"logos\">\n" +
    "            <img src=\"static/img/nature.png\">\n" +
    "            <img src=\"static/img/science.png\">\n" +
    "            <img src=\"static/img/chronicle.png\" class=\"dark\">\n" +
    "            <img src=\"static/img/bbc.png\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"landing-footer\">\n" +
    "        <div class=\"links col\">\n" +
    "            <a href=\"about\">About</a>\n" +
    "            <a href=\"http://twitter.com/impactstory\">Twitter</a>\n" +
    "            <a href=\"https://github.com/Impactstory/impactstory-tng\">GitHub</a>\n" +
    "        </div>\n" +
    "        <div class=\"funders col\">\n" +
    "            Supported by the\n" +
    "            <span class=\"funder\">the National Science Foundation</span>\n" +
    "            <span class=\"funder second\">and Alfred P. Sloan Foundation</span>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"orcid-dialog.tmpl.html\">\n" +
    "<md-dialog aria-label=\"Mango (Fruit)\"  ng-cloak>\n" +
    "        <md-dialog-content>\n" +
    "            <div class=\"md-dialog-content\">\n" +
    "                <p>Signing up for Impactstory requires an ORCID ID.  But don't worry, getting an ORCID ID is fast and free.\n" +
    "                <p>ORCID IDs are used to identify scholars, unambiguously linking them to their publications.  ORCID IDs are administered by a global, international, non-profit organization. Signing up for an ORCID ID is free, quick, and is increasingly required by funders, journals, and academic employers.</p>\n" +
    "            </div>\n" +
    "        </md-dialog-content>\n" +
    "    <md-dialog-actions layout=\"row\">\n" +
    "        <md-button ng-click=\"modalAuth()\">Get my ORCID!</md-button>\n" +
    "    </md-dialog-actions>\n" +
    "\n" +
    "</md-dialog>\n" +
    "</script>\n" +
    "");
}]);

angular.module("static-pages/page-not-found.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("static-pages/page-not-found.tpl.html",
    "<div class=\"page-404 static-page\">\n" +
    "    <h1>Sorry, we couldn't find that page!</h1>\n" +
    "\n" +
    "</div>");
}]);

angular.module("wizard/add-publications.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("wizard/add-publications.tpl.html",
    "<div class=\"page wizard add-publications\">\n" +
    "    <a class=\"logo\" href=\"/\">\n" +
    "        <img class=\"logo\" src=\"static/img/impactstory-logo-sideways.png\">\n" +
    "    </a>\n" +
    "    <div class=\"focus-container\">\n" +
    "        <div class=\"prompting\" ng-show=\"state=='prompting'\">\n" +
    "            <h2>Let's add your publications</h2>\n" +
    "            <div class=\"intro\">\n" +
    "                <p class=\"no-products\" ng-show=\"!auth.getPayload().num_products\">\n" +
    "                    Looks like there are no publications associated with your\n" +
    "                    ORCID. We'll need to fix that. But no worries&mdash;it'll take less\n" +
    "                    than five minutes.\n" +
    "                </p>\n" +
    "                <p class=\"some-products\" ng-show=\"auth.getPayload().num_products\">\n" +
    "                    Looks like your ORCID doesn't have all your publications associated with\n" +
    "                    it yet. But there's good news&mdash;fixing that will take less than\n" +
    "                    five minutes.\n" +
    "                </p>\n" +
    "                <p>\n" +
    "                    Once you're done, we'll automatically import your publications\n" +
    "                    into Impactstory and you'll be ready to roll.\n" +
    "                </p>\n" +
    "            </div>\n" +
    "\n" +
    "            <div>\n" +
    "                Here's how it works: we'll send you to the Scopus ORCID importer wizard\n" +
    "                in a new tab. You'll follow the steps in their wizard. When you're done,\n" +
    "                close that tab and come back here and check out your newly-complete\n" +
    "                Impactstory profile!\n" +
    "            </div>\n" +
    "            <div class=\"actions\">\n" +
    "                <a href=\"http://orcid.scopusfeedback.com/\"\n" +
    "                   target=\"_blank\"\n" +
    "                   ng-click=\"start()\"\n" +
    "                   class=\"btn btn-lg btn-primary\">Ok let's do it!</a>\n" +
    "            </div>\n" +
    "\n" +
    "        </div>\n" +
    "        <div class=\"working polling\" ng-show=\"state=='polling'\">\n" +
    "            <h2>Loading your new publications&hellip;</h2>\n" +
    "            <div class=\"loading-container\" ng-show=\"!error\">\n" +
    "                <md-progress-linear md-mode=\"indeterminate\"></md-progress-linear>\n" +
    "            </div>\n" +
    "            <div class=\"text\">\n" +
    "                <p>\n" +
    "                    This should only take a few seconds.\n" +
    "                </p>\n" +
    "                <p>\n" +
    "                    If you ran into trouble, you may want to make sure you completed the\n" +
    "                    Scopus import wizard.\n" +
    "                </p>\n" +
    "\n" +
    "\n" +
    "                <a href=\"http://orcid.scopusfeedback.com/\"\n" +
    "                   target=\"_blank\"\n" +
    "                   ng-click=\"start()\"\n" +
    "                   class=\"btn btn-lg btn-primary\">Start the wizard again</a>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"working making-profile\" ng-show=\"state=='making-profile'\">\n" +
    "            <h2>Imported {{ num_products_added }} new publications!</h2>\n" +
    "            <div class=\"loading-container\" ng-show=\"!error\">\n" +
    "                <md-progress-linear md-mode=\"indeterminate\"></md-progress-linear>\n" +
    "            </div>\n" +
    "            <span class=\"text\">\n" +
    "                We're crunching the numbers for these publications now. In a few seconds you'll be able\n" +
    "                to see your completed profile!\n" +
    "            </span>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("wizard/confirm-publications.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("wizard/confirm-publications.tpl.html",
    "<div class=\"page wizard confirm-publications\">\n" +
    "    <a class=\"logo\" href=\"/\">\n" +
    "        <img class=\"logo\" src=\"static/img/impactstory-logo-sideways.png\">\n" +
    "    </a>\n" +
    "    <div class=\"focus-container\">\n" +
    "        <div class=\"actions\" ng-hide=\"actionSelected\">\n" +
    "            <h2>We found some of your publications</h2>\n" +
    "            <div>\n" +
    "                Or more specifically, we found the {{ auth.getPayload().num_products }} publications\n" +
    "                listed in your ORCID profile.\n" +
    "                Is that the right number?\n" +
    "            </div>\n" +
    "            <span ng-click=\"confirm()\" class=\"btn btn-lg btn-success\">\n" +
    "\n" +
    "                <span class=\"text\">\n" +
    "                    <span class=\"main\"><i class=\"fa fa-check\"></i> Close enough,</span>\n" +
    "                    <span class=\"extra\">I can add more later</span>\n" +
    "                </span>\n" +
    "            </span>\n" +
    "            <a href=\"wizard/add-publications\" class=\"btn btn-lg btn-danger\">\n" +
    "                <span class=\"text\">\n" +
    "                    <span class=\"main\"><i class=\"fa fa-times\"></i> Nope,</span>\n" +
    "                    <span class=\"extra\">let's fix this now</span>\n" +
    "                </span>\n" +
    "            </a>\n" +
    "        </div>\n" +
    "        <div class=\"loading animated fadeInUp\" ng-show=\"actionSelected\">\n" +
    "            <h2>Finishing up&hellip;</h2>\n" +
    "            <div class=\"loading-container\">\n" +
    "                <md-progress-linear md-mode=\"indeterminate\"></md-progress-linear>\n" +
    "            </div>\n" +
    "            <span class=\"text\">\n" +
    "                We're crunching the numbers now. In a few seconds you'll be able\n" +
    "                to see your completed profile!\n" +
    "            </span>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("wizard/connect-orcid.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("wizard/connect-orcid.tpl.html",
    "<div class=\"page wizard link-your-orcid\">\n" +
    "    <a class=\"logo\" href=\"/\">\n" +
    "        <img class=\"logo\" src=\"static/img/impactstory-logo-sideways.png\">\n" +
    "    </a>\n" +
    "    <div class=\"focus-container\">\n" +
    "        <div class=\"intro\" ng-show=\"hasOrcid===null\">\n" +
    "            <h2>Welcome to Impactstory, {{ auth.getPayload().first_name }}!</h2>\n" +
    "            <p>Let's get your profile set up.</p>\n" +
    "\n" +
    "            <p>\n" +
    "                Impactstory is built on <a href=\"http://orcid.org\">ORCID</a>,\n" +
    "                a global nonprofit registry of researchers and their publications.\n" +
    "            </p>\n" +
    "            <p>Do you have an ORCID ID?</p>\n" +
    "            <div class=\"do-you-have-an-orcid\" ng-show=\"!hasOrcid\">\n" +
    "                <span class=\"have-orcid-yes btn btn-lg btn-success\"\n" +
    "                      ng-click=\"doYouHaveAnOrcid('yes')\">\n" +
    "                    <i class=\"fa fa-check\"></i>\n" +
    "                    Yes\n" +
    "                </span>\n" +
    "\n" +
    "                <span class=\"have-orcid-no btn btn-lg btn-danger\"\n" +
    "                      ng-click=\"doYouHaveAnOrcid('no')\">\n" +
    "                    <i class=\"fa fa-times\"></i>\n" +
    "                    No\n" +
    "                </span>\n" +
    "\n" +
    "                <span class=\"have-orcid-maybe btn btn-lg btn-info\"\n" +
    "                      ng-click=\"doYouHaveAnOrcid('maybe')\">\n" +
    "                    <i class=\"fa fa-question\"></i>\n" +
    "                    Maybe\n" +
    "                </span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div id=\"orcid-register-instr\">\n" +
    "            <div class=\"have-orcid-yes animated fadeInUp\" ng-show=\"hasOrcid=='yes'\">\n" +
    "                <h2>Great, let's use your ORCID!</h2>\n" +
    "                <div class=\"text\">\n" +
    "                    Once you're done, you'll be redirected back here, and will be\n" +
    "                    nearly done creating your profile.\n" +
    "                </div>\n" +
    "                <span class=\"btn btn-primary btn-lg\" ng-click=\"currentUser.orcidAuthenticate('connect', true)\">\n" +
    "                    Sign in to my ORCID\n" +
    "                </span>\n" +
    "            </div>\n" +
    "            <div class=\"have-orcid-no animated fadeInUp\" ng-show=\"hasOrcid=='no'\">\n" +
    "                <h2>No ORCID? No problem.</h2>\n" +
    "                <div class=\"text\">\n" +
    "                    <p>\n" +
    "                        You can create your ORCID in less than 30 seconds.\n" +
    "                    </p>\n" +
    "                    <p>\n" +
    "                        Once you're done, you'll be redirected back here, and will be\n" +
    "                        nearly done creating your profile.\n" +
    "                    </p>\n" +
    "                </div>\n" +
    "                <span class=\"btn btn-primary btn-lg\" ng-click=\"currentUser.orcidAuthenticate('connect', false)\">\n" +
    "                    Create my ORCID\n" +
    "                </span>\n" +
    "            </div>\n" +
    "            <div class=\"have-orcid-yes animated fadeInUp\" ng-show=\"hasOrcid=='maybe'\">\n" +
    "                <h2>No problem!</h2>\n" +
    "                <div class=\"text\">\n" +
    "                    <p>\n" +
    "                        Just register for a new ORCID. If you've already got one, ORCID will let you know\n" +
    "                        as part of their registration process.\n" +
    "                    </p>\n" +
    "\n" +
    "                    <p>\n" +
    "                        When you're done, you'll be redirected back here, and will be\n" +
    "                        nearly done creating your profile.\n" +
    "                    </p>\n" +
    "                </div>\n" +
    "                <span class=\"btn btn-primary btn-lg\" ng-click=\"currentUser.orcidAuthenticate('connect', false)\">\n" +
    "                    Try registering for an ORCID\n" +
    "                </span>\n" +
    "            </div>\n" +
    "\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "</div>\n" +
    "");
}]);
