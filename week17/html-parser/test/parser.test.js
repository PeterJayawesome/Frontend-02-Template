const assert = require('assert');

import { parseHTML } from "../src/parser";

describe("parse html: ", () => {
    it('<a>abc</a>', function(){
        const tree = parseHTML('<a></a>');
        // console.log("tree", tree);
        assert.equal(tree.children[0].tagName, "a");
        assert.equal(tree.children[0].children.length, 0);
    });
    it('<a href="test.test.test" alt="">abc</a>', function() {
        const tree = parseHTML('<a href="test.test.test" target="">abc</a>');
        // console.log("tree", JSON.stringify(tree));
        assert.equal(tree.children[0].tagName, "a");
        assert.equal(tree.children[0].children.length, 1);
        assert.equal(tree.children[0].attributes.length, 2);
        assert.equal(tree.children[0].attributes[0].name, "href");
        assert.equal(tree.children[0].attributes[0].value, "test.test.test");
    });
    it('<a href="test.test.test" />', function() {
        const tree = parseHTML('<a href="test.test.test" />');
        console.log("tree", JSON.stringify(tree));
        assert.equal(tree.children[0].tagName, "a");
        assert.equal(tree.children[0].children.length, 0);
        assert.equal(tree.children[0].attributes.length, 2);
        assert.equal(tree.children[0].attributes[0].name, "href");
        assert.equal(tree.children[0].attributes[0].value, "test.test.test");
    });
    it(`<a clickable href='test.test.test' disable/>`, function() {
        const tree = parseHTML("<a clickable href='test.test.test' disable/>");1
        // console.log("tree", JSON.stringify(tree));
        assert.equal(tree.children[0].tagName, "a");
        assert.equal(tree.children[0].children.length, 0);
        assert.equal(tree.children[0].attributes.length, 4);
        assert.equal(tree.children[0].attributes[1].name, "href");
        assert.equal(tree.children[0].attributes[1].value, "test.test.test");
    });
    it(`<a clickable href=abc disable />`, function() {
        const tree = parseHTML("<a clickable href=abc disable />");
        console.log("tree", JSON.stringify(tree));
        assert.equal(tree.children[0].tagName, "a");
        assert.equal(tree.children[0].children.length, 0);
        assert.equal(tree.children[0].attributes.length, 4);
        assert.equal(tree.children[0].attributes[1].name, "href");
        assert.equal(tree.children[0].attributes[1].value, 'abc');
    });

})