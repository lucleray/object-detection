const Layout = ({ sidebar, children }) => (
  <div className="container">
    <div className="main">{children}</div>
    <div className="sidebar">{sidebar}</div>
    <style jsx>{`
      .container {
        width: 100%;
      }
      .sidebar {
        position: fixed;
        width: 500px;
        height: 100%;
        top: 0;
        left: 0;
        border-right: 1px solid #ccc;
        background: white;
        overflow: auto;
      }
      .main {
        position: fixed;
        width: calc(100% - 500px);
        height: 100%;
        top: 0;
        right: 0;
        background: #eee;
      }
      @media screen and (max-width: 1000px) {
        .sidebar {
          position: relative;
          width: 100%;
          height: auto;
          border-right: 0;
        }
        .main {
          position: relative;
          width: 100%;
        }
      }
    `}</style>
  </div>
)

export default Layout
