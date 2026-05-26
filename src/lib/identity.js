export function getAnonUserId() {
  let id = localStorage.getItem('sds_user_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('sds_user_id', id);
  }
  return id;
}
