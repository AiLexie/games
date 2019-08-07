from flask_restful import Resource
from flask import abort, request
from webargs import fields
from webargs.flaskparser import use_args
import app.wiki.models as wiki_models
from app.extensions import db

wiki_article_args = {
    "title": fields.Str(required=True, help="title of type string is required"),
    "category": fields.Str(required=True, help="category of type string is required"),
}

language_article_args = {
    "markdown": fields.Str(required=True, help="markdown of type str is required"),
}


class WikiArticle(Resource):
    def get(self, id=None):
        if id is None:
            return "all"
        else:
            return "single <id>"

    def put(self, id=None):
        if id is None:
            # create a new WikiArticle
            self._put_wiki_article()
        else:
            # add a LanguageArticle to wiki
            self._put_language_article(id)

        return {"message": "added"}, 201

    @use_args(wiki_article_args)
    def _put_wiki_article(self, args):
        article = wiki_models.WikiArticle(**args)
        db.session.add(article)
        db.session.commit()

        return {"message": "wiki article was added successfully"}, 201

    @use_args(language_article_args)
    def _put_language_article(self, id, args):
        pass

    def patch(self, id):
        pass

    def delete(self, id):
        pass


def register_wiki_endpoints(api):
    api.add_resource(
        WikiArticle,
        "/wiki/article",
        "/wiki/article/<id>"
    )
