import axios from '@/lib/axios';

/**
 * 자연어 기반 인재 검색
 * @param {Object} params
 * @param {string} params.conversationId - 대화 세션 ID (ex. 'test10')
 * @param {string} params.nl - 자연어 검색 문장
 * @returns {Promise<Object>}
 */
export const searchPeopleByNL = async ({ conversationId, nl }) => {
    const response = await axios.post(
        '/api/search/conversation',
        null,
        {
            params: {
                conversationId,
                nl
            }
        }
    );

    return response.data;
};
