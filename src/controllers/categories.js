'use strict';

const nconf = require('nconf');
const _ = require('lodash');

const categories = require('../categories');
const meta = require('../meta');
const pagination = require('../pagination');
const helpers = require('./helpers');
const privileges = require('../privileges');

const categoriesController = module.exports;

categoriesController.list = async function (req, res) {
    res.locals.metaTags = [{
        name: 'title',
        content: String(meta.config.title || 'NodeBB'),
    }, {
        property: 'og:type',
        content: 'website',
    }];
    console.log("src/controllers/categories.js req.query", req.query);
    const allRootCids = await categories.getAllCidsFromSet('cid:0:children');
    const rootCids = await privileges.categories.filterCids('find', allRootCids, req.uid);
    const pageCount = Math.max(1, Math.ceil(rootCids.length / meta.config.categoriesPerPage));
    const page = Math.min(parseInt(req.query.page, 10) || 1, pageCount);
    const start = Math.max(0, (page - 1) * meta.config.categoriesPerPage);
    const stop = start + meta.config.categoriesPerPage - 1;
    const pageCids = rootCids.slice(start, stop + 1);

    const allChildCids = _.flatten(await Promise.all(pageCids.map(categories.getChildrenCids)));
    const childCids = await privileges.categories.filterCids('find', allChildCids, req.uid);
    const categoryData = await categories.getCategories(pageCids.concat(childCids), req.uid);
    const tree = categories.getTree(categoryData, 0);
    await categories.getRecentTopicReplies(categoryData, req.uid, req.query);

    const data = {
        title: meta.config.homePageTitle || '[[pages:home]]',
        selectCategoryLabel: '[[pages:categories]]',
        categories: tree,
        pagination: pagination.create(page, pageCount, req.query),
    };

    data.categories.forEach((category) => {
        if (category) {
            helpers.trimChildren(category);
            helpers.setCategoryTeaser(category);
        }
    });
    // console.log("src/controllers/categories.js data after trim and category teaser set", data);
    // console.log("src/controllers/categories.js General Discussion data.posts", data.categories[1].posts);
    // console.log("src/controllers/categories.js General Discussion data.teaser", data.categories[1].teaser);
    // console.log("src/controllers/categories.js Comments Feedback data.posts", data.categories[2].posts);
    // console.log("src/controllers/categories.js Comments Feedback data.teaser", data.categories[2].teaser);
    // console.log("src/controllers/categories.js Announcements data.posts", data.categories[0].posts);
    data.categories.forEach(category => {
        if (category.posts && category.posts.length > 0) {
            category.posts = category.posts.map(post => {
                // Directly create an updated user object for anonymity
                const updatedUser = post.anonymous ?
                {
                    uid: 0,
                    username: 'anonymous',
                    userslug: 'anonymous',
                    picture: null,
                    status: 'online',
                    displayname: 'Anonymous User',
                    'icon:text': 'A',
                    'icon:bgColor': '#673ab7',
                } : post.user;

                // Return the post with the updated user object
                return {
                    ...post,
                    user: updatedUser,
                };
            });
        }
    });

    // Debug: Log a specific post to verify changes
    // console.log(data.categories[1].posts[0]);



    // Log the updated data structure to verify the changes
    // console.log(JSON.stringify(data, null, 2));
    console.log("src/controllers/categories.js General Discussion data.posts", data.categories[1].posts);
    console.log("src/controllers/categories.js Comments Feedback data.posts", data.categories[2].posts);
    console.log("src/controllers/categories.js General Discussion data.teaser", data.categories[1].teaser);
    console.log("src/controllers/categories.js Comments Feedback data.teaser", data.categories[2].teaser);
    console.log("src/controllers/categories.js data after anon edit", data);


    if (req.originalUrl.startsWith(`${nconf.get('relative_path')}/api/categories`) || req.originalUrl.startsWith(`${nconf.get('relative_path')}/categories`)) {
        data.title = '[[pages:categories]]';
        data.breadcrumbs = helpers.buildBreadcrumbs([{ text: data.title }]);
        res.locals.metaTags.push({
            property: 'og:title',
            content: '[[pages:categories]]',
        });
    }

    res.render('categories', data);
};
