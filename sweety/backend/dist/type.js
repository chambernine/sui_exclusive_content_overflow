export var DraftAlbumStatus;
(function (DraftAlbumStatus) {
    DraftAlbumStatus[DraftAlbumStatus["draft"] = 0] = "draft";
    DraftAlbumStatus[DraftAlbumStatus["requestApprove"] = 1] = "requestApprove";
    DraftAlbumStatus[DraftAlbumStatus["approved"] = 2] = "approved";
    DraftAlbumStatus[DraftAlbumStatus["reject"] = 3] = "reject";
})(DraftAlbumStatus || (DraftAlbumStatus = {}));
export var AlbumTier;
(function (AlbumTier) {
    AlbumTier[AlbumTier["standard"] = 0] = "standard";
    AlbumTier[AlbumTier["premium"] = 1] = "premium";
    AlbumTier[AlbumTier["exclusive"] = 2] = "exclusive";
    AlbumTier[AlbumTier["principle"] = 3] = "principle";
})(AlbumTier || (AlbumTier = {}));
