import React from "react";
import CardList from "../shared/CardList";
import { Row, Col } from "react-grid-system";
import AuthService from "../AuthService";

const articleCategories = [
  { label: "Gameplay", value: "gameplay"},
  { label: "Guide", value: "guide"},
  { label: "Pets", value: "pets"},
  { label: "Classes", value: "classes"},
]

const AddArticle = () => {
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState(articleCategories[0].value);

  const auth = new AuthService();

  const addArticle = () => {
    console.log(category)
    auth.fetch("PUT", `wiki/article`, {
      body: {
        title: title,
        category: category
      }
    })
    .then(res => {
      if (res.error) {
        alert(res.errorMessage)
      }
      else {
        
      }
    })
  }


  return (
    <Row justify="center">
      <Col md={6}>

        <CardList header={true}>
          <span className="card-title">Add an article</span>
          <div>
            <input 
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Title"
            />
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="cate1">Cate1</option>
              <option value="cate2">Cate2</option>
              <option value="cate3">Cate3</option>
            </select>
            <button onClick={addArticle}>Add</button>
          </div>
        </CardList>

      </Col>
    </Row>
  )
}

export default AddArticle;