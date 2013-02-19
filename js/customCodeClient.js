define("customCodeClient",["jquery"],function(e){var t=this,n=function(e){var t=e.getDate(),n=e.getMonth()+1,r=e.getFullYear(),i=n+"/"+t+"/"+r;return i};return{getQueryVariable:function(e,t){var n=e.split("?");if(n.length>1){var r=n[1].split("&");for(var i=0;i<r.length;i++){var s=r[i].split("=");if(s[0]==t)return s[1]}}return null},showMessage:function(e){alert(e)},getNextUserID:function(e){var t=StackMob.Model.extend({schemaName:"user_id_counter"}),n=new t({user_id_counter_id:"1"});n.fetch({success:function(t){t.incrementOnSave("current_id",1),t.save({},{success:function(t){if(typeof e=="function"){var n=t.get("current_id");n?e(!0,n):e(!1)}},error:function(t,n){console.debug("Aww...why did you fail on me?! "+n.error),typeof e=="function"&&e(!1)}})},error:function(t,n){console.debug(n),typeof e=="function"&&e(!1)}})},getFitbitRequestToken:function(e,t){if(typeof t!="function")throw"callback is required";StackMob.customcode("fetch_fitbit_request_token",{stackmob_user_id:e},{success:function(e){t(!0,e)},error:function(e){t(!1,e)}})},getFitbitAccessToken:function(e,t,n,r){if(typeof r!="function")throw"callback is required";var i={request_token:e,request_token_secret:t,oauth_verifier:n};StackMob.customcode("fetch_fitbit_access_token",i,"GET",{success:function(e){r(!0,e)},error:function(e){r(!1,e)}})},getFitbitUser:function(e,t,n,r){if(typeof r!="function")throw"callback is required";var i={access_token:e,access_token_secret:t,fitbit_user_id:n};StackMob.customcode("fetch_fitbit_user",i,"GET",{success:function(e){var t=e.userInfoJson,n=JSON.parse(t).user;r(!0,n)},error:function(e){r(!1,e)}})},lookupFitnessUser:function(e,t,n){if(typeof n!="function")throw"callback is required";var r=this;if(!e){typeof n=="function"&&n(!1,"email address is required");return}var i=StackMob.Model.extend({schemaName:"user"}),s=StackMob.Collection.extend({model:i}),o=new s,u=new StackMob.Collection.Query;u.equals("email",e),t&&u.equals("fc_password",t),o.query(u,{success:function(e){e.length==1?n(!0,e.models[0]):n(!1,"Could not find user with given email and password")},error:function(e){r.showMessage("query failed trying to get user "+e),console.debug(e),n(!1,e)}})},createStackmobUser:function(e,t,n){var r=this;typeof n!="function"&&(n=function(){}),r.lookupFitnessUser(e,t,function(i,s){if(i){n(!1,"That email address is already in use");return}r.getNextUserID(function(r,i){if(r){var s={email:e,password:t,fc_password:t,username:i.toString()},o=new StackMob.User(s);o.create({success:function(e){console.debug("user object is saved"),n(!0,e)},error:function(e,t){console.debug(t),n(!1,"failed to save user to datastore")}})}else n(!1,"Failed to get next StackMob user ID")})})},updateUserWithParams:function(e,t,n){if(typeof n!="function")throw"callback is required";delete t.encodedid;for(var r in t)t.hasOwnProperty(r)&&e.set(r,t[r]);var i=new StackMob.User({username:e.get("username")});i.save(e,{success:function(e){console.debug(e.toJSON()),n(!0,e)},error:function(e,t){console.debug(t),n(!1,t)}})},getFitbitFriends:function(e,t){var n=this,r;StackMob.customcode("fetch_fitbit_friends",{stackmob_user_id:e},"GET",{success:function(e){r="got friends!<br/>\n";var n=e.friendsJson,i=JSON.parse(n).friends;typeof t=="function"&&t(!0,i)},error:function(e){n.showMessage("failed to get your Fitbit friends"),typeof t=="function"&&t(!1,e)}})},showFriends:function(t){var n="",r=t.length,i;for(var s=0;s<r;s++){i=t[s].user;for(var o in i)n+=o+": "+i[o]+"<br>\n"}e("#results").html(n)},getFriends:function(e){this.user.get("friends")},saveFriendsToStackmob:function(e){var t=fitness,n=[],r=e.length;for(var i=0;i<r;i++){var s=e[i].user;n.push(s.encodedId)}var o=StackMob.Model.extend({schemaName:"user"}),u=StackMob.Collection.extend({model:o}),a=new u,f=new StackMob.Collection.Query;f.mustBeOneOf("fitbituserid",n),a.query(f,{success:function(e){var i=[];if(e.models.length>0){r=e.models.length;for(var s=0;s<r;s++){var o=e.models[s];i.push(o.username)}}var u=new StackMob.User({username:t.user.get("username")}),a={friends:i,friendcount:i.length,fitbitfriendcount:n.length};u.save(a,{success:function(e){console.debug(e.toJSON()),typeof callback=="function"&&callback(!0,e)},error:function(e,t){console.debug(t),typeof callback=="function"&&callback(!1,t)}})},error:function(e){}})},updateActivities:function(e){var t=new Date,n=new Date(t.getTime()-5184e5),r={stackmob_user_id:this.user.get("username"),start_date:this.formatDate(n),end_date:this.formatDate(t)};StackMob.customcode("update_fitbit_activities",r,{success:function(t){typeof e=="function"&&e(!0,t)},error:function(t){typeof e=="function"&&e(!1,t)}})},completeFitbitAuth:function(e,t,n,r,i){var s=this;this.getFitbitAccessToken(t,n,r,function(t,n){t?s.getFitbitUser(n.oauth_token,n.oauth_token_secret,n.fitbit_user_id,function(t,r){if(t){delete r.encodedID;var o=r;o.accesstoken=n.oauth_token,o.accesstokensecret=n.oauth_token_secret,o.fitbituserid=n.fitbit_user_id,s.updateUserWithParams(e,o,function(e,t){e?i(!0,t):i(!1,"failed to update with fitbit info\n "+t.error)})}else i(!1,"failed to get Fitbit User: "+r)}):i(!1,"failed to get Fitbit access token")})},loginWithID:function(e,t){if(typeof t!="function")throw"callback is required";if(e){var n=new StackMob.User({username:e});n.fetch({success:function(e){t(!0,e)},error:function(e){t(!1,"could not retrieve your data"+e)}})}},getChallengeInvites:function(e){var n=StackMob.Model.extend({schemaName:"invitation"}),r=StackMob.Collection.extend({model:n}),i=new r,s=new StackMob.Collection.Query;s.equals("inviteduser",this.user.get("username")),s.equals("responded",!1),i.query(s,{success:function(t){var n=t.models.length;if(n===0){typeof e=="function"&&e(!1,t);return}for(var r=0;r<n;r++){var i=t.models[r],s=StackMob.Model.extend({schemaName:"challenge",challenge_id:i.challenge_id}),o=new s;o.fetch({success:function(e){alert("you have a challenge invitation from "+e.get("challengecreator")+"!"),console.debug(e.toJSON())},error:function(e,t){console.debug(t)}})}},error:function(n){t.showMessage("query failed trying to get user "+n),console.debug(n),typeof e=="function"&&e(!1,n)}})}}});