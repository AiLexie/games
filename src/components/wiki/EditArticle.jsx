import React from "react";
import ReactMde from "react-mde";
import ReactMarkdown from "react-markdown/with-html";
import "react-mde/lib/styles/css/react-mde-all.css";
import AuthService from "../AuthService";

function getMarkdownPreview(markdown) {
  let promise = new Promise((resolve, reject) => {
    let preview = <ReactMarkdown escapeHtml={false} source={markdown} />
    resolve(preview)
  })
  return promise;
}


const EditArticle = (props) => {
  const articleId = props.match.params.id;

  const [article, setArticle] = React.useState({});
  const [value, setValue] = React.useState("<p>test</p>");
  const [selectedTab, setSelectedTab] = React.useState("write");

  const [articleTitle, setArticleTitle] = React.useState("");
  const [selectedLanguage, setSelectedLanguage] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("");

  const auth = new AuthService();

  const getArticle = () => {
    auth.fetch("GET", `wiki/article/${articleId}`)
    .then(res => {
      if (res.error) {
        alert(res.errorMessage)
      }
      else {
        
      }
    })
  }

  const saveArticle = () => {

  }

  React.useEffect(() => {
    getArticle();
  })

  return (
    <div>
      <div>
        <input
          placeholder="title"
          value={articleTitle} 
          onChange={e => setArticleTitle(e.target.value)}
          disabled={true}
        />
        <select 
          placeholder="language" 
          value={selectedLanguage}
          onChange={e => setSelectedLanguage(e.target.value)}
        >
          <option value="de">DE</option>
          <option value="en">EN</option>
        </select>
        <select 
          placeholder="category" 
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          disabled={true}
        >
          <option value="guide">Guide</option>
          <option value="gameplay">Gameplay</option>
        </select>
        <button onClick={saveArticle}>Save</button>
      </div>
      <ReactMde
        value={value}
        onChange={setValue}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        generateMarkdownPreview={getMarkdownPreview}
      />
    </div>
  )
}

export default EditArticle;