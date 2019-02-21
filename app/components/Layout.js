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
      }
      .main {
        position: fixed;
        width: calc(100% - 481px);
        height: 100%;
        top: 0;
        right: 0;
        background: #eee;
      }
    `}</style>
  </div>
)

export default Layout
