# X API

Gives programmatic access to X's posts, users, spaces, and more

## API Specification

The X API exposes over 30 endpoints, implemented using standalone REST applications designed to consume particular event type. In this system, the client is responsible for supplying required and optional parameters using the full URL path and URL query string. The server is responsible for parsing the URL amd producing the required computational effects upstream to the REST application.

Resulting endpoint responses contain will a structured JSON object in its payload. These may represent posts, users, media, and more data objects consumed across the platform.

### Fields and Expansions

The X API v2 data object specification declares a small number of default fields when making a request without the use of the fields or expansions parameters. Clients have the option to specify a fields parameter to request additional data.

```
# TODO: examples
```


depending on the authentication type used by the request you are sending

for reading and writing objects to X.



## Authentication

### Types

The X API grants access to data shared by and uniquely authorized to particular users. Different endpoints choose a compatible subset of the below 4 authentication methods.

More information is available

| Name | Use Case |
| :--- | :--- |
| OAuth 1.0a User Context | Allows an authorized X developer App to access private account information or perform a X action on behalf of a X account. |
| OAuth 2.0 App Only | Allows a X developer app to access information publicly available on X. |
| OAuth 2.0 Authorization Code Flow with PKCE | Allows you to authenticate on behalf of another account with greater control over an application's scope, and authorization flows across multiple devices. |
| Basic Authentication | Many of X's enterprise APIs require the use of HTTP Basic Authentication. |


## Configuration

#### App permissions (required)

These permissions enable OAuth 1.0a Authentication. See [v2 endpoint auth mapping](#authentication-requirements---v2-api-authentication-mapping) for details.

- [ ] Read Posts and profile information
- [x] Read and Post Posts and profile information
- [ ] Read Posts and profile information, read and post Direct messages
- [ ] To request email from users, you are required to provide URLs to your App's privacy policy and terms of service.

### Tokens

#### Bearer Token (App-Only Authentication)

Bearer Token authenticates requests on behalf of your developer App.

```
X_CLAYCURRY_STUDIO_BOOKMARKS_BEARER_TOKEN=
```

#### OAuth 1.0

The API Key and Secret (also known as Consumer Key and Secret) are the most fundamental credentials required to access the X API. These credentials act as the username and password for your X App, and are used by the X API to understand which App requests are coming from.


**Consumer Key** — Think of these as the user name and password that represents your App when making API requests. While your Secret will remain permanently hidden, you can always view the last 6 characters of your Consumer Key.

```
X_CLAYCURRY_STUDIO_BOOKMARKS_CONSUMER_KEY=
```

**Access Token** — An Access Token and Secret are user-specific credentials used to authenticate OAuth 1.0 API requests. They specify the X account the request is made on behalf of.

```
X_CLAYCURRY_STUDIO_BOOKMARKS_ACCESS_TOKEN=
X_CLAYCURRY_STUDIO_BOOKMARKS_ACCESS_TOKEN_SECRET=
```

##### [Obtaining Access Tokens using 3-legged OAuth flow](https://docs.x.com/fundamentals/authentication/oauth-1-0a/obtaining-user-access-tokens)

To perform actions on behalf of another user, you’ll need to obtain their access tokens. Access tokens specify the X account the request is made on behalf of, so for you to obtain these they will need to first grant you access. 
 
 These tokens do not expire but can be revoked by the user at any time. 


#### OAuth 2.0 Keys

OAuth 2.0 allows users to log in to your App with X. It also allows your App to make specific requests for authenticated users.

**Client ID** — Think of your Client ID as the user name that allows you to use OAuth 2.0 as an authentication method.

```
X_CLAYCURRY_STUDIO_BOOKMARKS_CLIENT_ID=
```

**Client Secret** — Think of your Client Secret as the password that allows you to use OAuth 2.0 as an authentication method.

```
X_CLAYCURRY_STUDIO_BOOKMARKS_CLIENT_SECTET=
```

Documentation Index: https://docs.x.com/llms.txt


## FAQ

### How long will my credentials stay valid?  

By default, the access token you create through the Authorization Code Flow with PKCE will only stay valid for two hours unless you’ve used the `offline.access` scope.

Enabling this produces a [Refresh Token](https://docs.x.com/fundamentals/authentication/oauth-2-0/authorization-code#refresh-tokens)


### Authentication Requirements - v2 API Authentication Mapping

The following chart illustrates which v2 endpoints map to what authentication methods.

| Endpoint | OAuth 1.0a User Context | OAuth 2.0 App Only | OAuth 2.0 PKCE | Scopes |
| :--- | :---: | :---: | :---: | :--- |
| **Users lookup** — Retrieve users by ID or username | ✅ | ✅ | ✅ | `tweet.read`, `users.read` |
| **Tweet lookup** — Retrieve Tweets by ID | ✅ | ✅ | ✅ | `tweet.read`, `users.read` |
| **Retweets lookup** — Users who Retweeted a Tweet | ✅ | ✅ | ✅ | `tweet.read`, `users.read` |
| **Bookmarks lookup** — Get bookmarked Tweets | | | ✅ | `tweet.read`, `users.read`, `bookmark.read` |
| **Likes lookup** — Users who liked / Tweets liked by user | ✅ | ✅ | ✅ | `tweet.read`, `users.read`, `like.read` |
| **Follows lookup** — Following / followers of a user | ✅ | ✅ | ✅ | `tweet.read`, `users.read`, `follows.read` |
| **Manage Bookmarks** — Bookmark / remove bookmark | | | ✅ | `tweet.read`, `users.read`, `bookmark.write` |
| **Filtered stream** — Add/delete rules, connect to stream | | ✅ | | |

### Authentication Settings - options

#### App permissions (required)

These permissions enable OAuth 1.0a Authentication.

| Scope | Description | Active | Justification |
| :--- | :--- | :---: | :--- |
| Read | Read Posts and profile information | ✅ | Needed to read bookmarks and user data |
| Write | Post Posts and profile information | ✅ | Needed to manage bookmarks |
| Direct message | Read and post Direct messages | | Not needed |
| Request email | Request email from users | | Requires privacy policy and terms of service URLs |

#### Type of App (required)

The type of App enables OAuth 2.0 Authentication.

- **Native App** — Public client
- **Web App, Automated App or Bot** — Confidential client ✅

#### App info

| Field | Value |
| :--- | :--- |
| Callback URI / Redirect URL (required) | `https://www.claycurry.studio/api/x/callback` |
| Website URL (required) | `https://www.claycurry.studio` |
| Organization name | |
| Organization URL | |
| Terms of Service | |
| Privacy Policy | |

<!--
(unused)

| Endpoint | OAuth 1.0a User Context | OAuth 2.0 App Only | OAuth 2.0 PKCE | Scopes |
| :--- | :---: | :---: | :---: | :--- |
| **Manage Tweets** — Post / delete a Tweet | ✅ | | ✅ | `tweet.read`, `tweet.write`, `users.read` |
| **Timelines** — User Tweet / mention / reverse-chronological timeline | ✅ | ✅ | ✅ | `tweet.read`, `users.read` |
| **Recent search** — Tweets from last 7 days | ✅ | ✅ | ✅ | `tweet.read`, `users.read` |
| **Full-archive search** — Academic Research access only | | ✅ | | |
| **Volume streams** — ~1% of all Tweets in real-time | | ✅ | | |
| **Manage Retweets** — Retweet / undo Retweet | ✅ | | ✅ | `tweet.read`, `tweet.write`, `users.read` |
| **Manage Likes** — Like / unlike a Tweet | ✅ | | ✅ | `tweet.read`, `users.read`, `like.write` |
| **Hide replies** — Hide or unhide a reply | ✅ | | ✅ | `tweet.read`, `users.read`, `tweet.moderate.write` |
| **Manage follows** — Follow / unfollow a user | ✅ | | ✅ | `tweet.read`, `users.read`, `follows.write` |
| **Blocks lookup** — Users blocked by a user | ✅ | | ✅ | `tweet.read`, `users.read`, `block.read` |
| **Manage Mutes** — Mute / unmute a user | ✅ | | ✅ | `tweet.read`, `users.read`, `mute.write` |
| **Mutes lookup** — Users muted by a user | ✅ | | ✅ | `tweet.read`, `users.read`, `mute.read` |
| **Spaces lookup** — Lookup Spaces by ID or creator | | ✅ | ✅ | `tweet.read`, `users.read`, `space.read` |
| **Spaces buyers** — Users who purchased a ticket | | | ✅ | `tweet.read`, `users.read`, `space.read` |
| **Spaces search** — Search live or scheduled Spaces | | ✅ | ✅ | `tweet.read`, `users.read`, `space.read` |
| **List lookup** — Lookup Lists by ID or owner | ✅ | ✅ | ✅ | `tweet.read`, `users.read`, `list.read` |
| **Manage Lists** — Create a List | ✅ | | ✅ | `tweet.read`, `users.read`, `list.read`, `list.write` |
| **Manage Lists** — Delete / update a List | ✅ | | ✅ | `tweet.read`, `users.read`, `list.write` |
| **List Tweets lookup** — Tweets from a List | ✅ | ✅ | ✅ | `tweet.read`, `users.read`, `list.read` |
| **List members lookup** — Members of a List | ✅ | ✅ | ✅ | `tweet.read`, `users.read`, `list.read` |
| **Manage List members** — Add / remove members | ✅ | | ✅ | `tweet.read`, `users.read`, `list.write` |
| **List follows lookup** — Followers of a List | ✅ | ✅ | ✅ | `tweet.read`, `users.read`, `list.read` |
| **Manage List follows** — Follow / unfollow a List | ✅ | | ✅ | `tweet.read`, `users.read`, `list.write` |
| **Pinned List lookup** — Pinned Lists of authenticated user | ✅ | | ✅ | `tweet.read`, `users.read`, `list.read` |
| **Manage pinned List** — Pin / unpin a List | ✅ | | ✅ | `tweet.read`, `users.read`, `list.write` |
| **Batch compliance** — Create / get compliance jobs | | ✅ | | |
-->
