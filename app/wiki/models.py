from app.base_model import BaseModel
from app.extensions import db


class WikiArticle(BaseModel):
    __tablename__ = "wiki_article"
    __bind_key__ = "unstatic_florensia_data"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    title = db.Column(db.String)
    category = db.Column(db.String)

    articles = db.relationship("Article")


class Article(BaseModel):
    __tablename__ = "article"
    __bind_key__ = "unstatic_florensia_data"

    index = db.Column(db.Integer, primary_key=True, autoincrement=True)
    wiki_article_id = db.Column(db.Integer, db.ForeignKey("wiki_article.id"))

    markdown = db.Column(db.Text, nullable=False)
