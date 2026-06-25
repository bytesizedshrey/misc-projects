# Definition for singly-linked list.
# class ListNode(object):
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution(object):
    def deleteDuplicates(self, head):
        """
        :type head: ListNode
        :rtype: ListNode
        """
        currentVal = head
        while currentVal and currentVal.next:
            if currentVal.val == currentVal.next.val:
                currentVal.next = currentVal.next.next
            else:
                currentVal = currentVal.next
        return head