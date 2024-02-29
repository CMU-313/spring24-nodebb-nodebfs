'use strict';

const nconf = require('nconf');
const _ = require('lodash');

const categories = require('../categories');
const assert = require('assert');
const meta = require('../meta');
const pagination = require('../pagination');
const helpers = require('./helpers');
const privileges = require('../privileges');

const categoriesController = module.exports;

// async function categoriesController.list(req: object, res: object)
categoriesController.list = async function (req, res) {
    assert(typeof req === 'object');
    assert(typeof res === 'object');
    res.locals.metaTags = [{
        name: 'title',
        content: String(meta.config.title || 'NodeBB'),
    }, {
        property: 'og:type',
        content: 'website',
    }];
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

    data.categories.forEach(category => {
        if (category.posts && category.posts.length > 0) {
            category.posts = category.posts.map(post => {
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

                return {
                    ...post,
                    user: updatedUser,
                };
            });
        }
    });

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
