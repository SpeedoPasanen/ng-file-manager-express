import get from './get';
import post from './post';
import _delete from './delete';
import head from './head';
export const NGFM_VERBS = {
    get,
    post,
    delete: _delete,
    head
}
