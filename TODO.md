-- ESSENTIAL -------------------------------------------------------------------

[x] Modals with `isDismissed` should be treated as closed.
[ ] Add `isPresent` flag. Like `isOpen` but `isDismissed` is not considered.
[ ] Consecutive `.open()` call should move modal to top of the stack

-- MISC ------------------------------------------------------------------------

[ ] Return focus to previously focused element after close. Should be implemented in `use-modal-extras.ts`.
[ ] Add drag2close ability.
[ ] Modal implementations should control inertness of the content.
[ ] Consider usage of `AbortSignal` for dismiss invocation.
[ ] Add test case for `requestDismiss` with `window.confirm()`

-- TO CONSIDER -----------------------------------------------------------------

[ ] Add **Pool** functionality. `useModalsPool`.
[ ] Modal resolution (returned by `modal.open()` should became `ModalOpenRequest` which looks like `{ resolution: Promise<Resolution>, wasOpened: boolean /*false if modal was not open for some reason */ }`).
