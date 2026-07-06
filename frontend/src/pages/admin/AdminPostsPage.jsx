import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import postService from '../../services/postService';
import AdminSidebar from '../../components/admin/AdminSidebar';

function AdminPostsPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await postService.getAll();
      setPosts(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Bạn có chắc muốn xóa bài viết "${title}"?`)) return;
    try {
      await postService.delete(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert('Xóa thất bại!');
    }
  };

  const handleToggleActive = async (post) => {
    try {
      const updated = await postService.update(post.id, { ...post, active: !post.active });
      setPosts((prev) => prev.map((p) => (p.id === post.id ? updated : p)));
    } catch (err) {
      alert('Cập nhật trạng thái thất bại!');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-page-header">
          <h1>📝 Quản Lý Bài Viết</h1>
          <Link to="/admin/posts/create" className="btn btn-primary">
            + Thêm bài viết
          </Link>
        </div>

        <div className="admin-toolbar">
          <span className="record-count">{posts.length} bài viết</span>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Đang tải...</p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Ảnh</th>
                  <th>Tiêu đề</th>
                  <th>Tác giả</th>
                  <th>Ngày tạo</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                      Chưa có bài viết nào. <Link to="/admin/posts/create" style={{ color: '#6c63ff' }}>Thêm bài viết mới</Link>
                    </td>
                  </tr>
                ) : (
                  posts.map((post, index) => (
                    <tr key={post.id}>
                      <td>{index + 1}</td>
                      <td>
                        <img
                          src={post.imageUrl || 'https://placehold.co/80x50/1a1a2e/ffffff?text=Post'}
                          alt={post.title}
                          className="admin-product-img"
                          style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '6px' }}
                          onError={(e) => { e.target.src = 'https://placehold.co/80x50/1a1a2e/ffffff?text=Post'; }}
                        />
                      </td>
                      <td>
                        <strong>{post.title}</strong>
                        {post.summary && (
                          <p style={{ color: '#999', fontSize: '12px', margin: '2px 0 0', maxWidth: '280px',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {post.summary}
                          </p>
                        )}
                      </td>
                      <td>{post.author || '-'}</td>
                      <td>{formatDate(post.createdAt)}</td>
                      <td>
                        <span
                          className={`stock-badge ${post.active ? 'in-stock' : 'out-stock'}`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleToggleActive(post)}
                          title="Bấm để bật/tắt hiển thị"
                        >
                          {post.active ? 'Đang hiển thị' : 'Đã ẩn'}
                        </span>
                      </td>
                      <td className="action-cell">
                        <button
                          className="btn-action btn-edit"
                          onClick={() => navigate(`/admin/posts/edit/${post.id}`)}
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => handleDelete(post.id, post.title)}
                        >
                          🗑️ Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminPostsPage;
