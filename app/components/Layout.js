const Layout = ({ sidebar, children }) => (
  <div>
    <div className="main">{children}</div>
    <div className="sidebar">{sidebar}</div>
    <style jsx>{`
      .sidebar {
        position: fixed;
        width: 400px;
        padding: 30px 40px;
        height: 100%;
        top: 0;
        left: 0;
        border-right: 1px solid #ccc;
        background: white;
        overflow: auto;
      }
      .main {
        position: fixed;
        width: calc(100% - 481px);
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
